import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { StoreReturnRequest } from "../models/StoreReturnRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { roundMoney } from "../utils/inventory.js";

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  return ["pending", "approved", "rejected"].includes(status) ? status : "";
}

async function findProduct({ productId, productCode, barcode }) {
  if (mongoose.Types.ObjectId.isValid(productId)) {
    const byId = await Product.findById(productId);
    if (byId) return byId;
  }

  const clauses = [];
  if (productCode) clauses.push({ code: productCode });
  if (barcode) clauses.push({ barcode }, { barcodeAliases: barcode });
  if (!clauses.length) return null;

  return Product.findOne({ $or: clauses });
}

export const listStoreReturns = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(300, Math.max(1, Number(req.query.limit) || 100));
  const status = normalizeStatus(req.query.status);
  const productId = String(req.query.productId || "").trim();

  const query = {};
  if (status) query.status = status;
  if (productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Mahsulot ID noto'g'ri" });
    }
    query.productId = productId;
  }

  const [requests, total, summaryAgg] = await Promise.all([
    StoreReturnRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    StoreReturnRequest.countDocuments(query),
    StoreReturnRequest.aggregate([
      {
        $group: {
          _id: "$status",
          totalRequested: { $sum: "$requestedQty" },
          totalApproved: { $sum: "$approvedQty" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summary = {
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalRequested: 0,
    totalApproved: 0,
  };
  for (const row of summaryAgg) {
    if (row._id === "pending") summary.pendingCount = Number(row.count || 0);
    if (row._id === "approved") summary.approvedCount = Number(row.count || 0);
    if (row._id === "rejected") summary.rejectedCount = Number(row.count || 0);
    summary.totalRequested = roundMoney(summary.totalRequested + Number(row.totalRequested || 0));
    summary.totalApproved = roundMoney(summary.totalApproved + Number(row.totalApproved || 0));
  }

  return res.json({ requests, total, page, limit, summary });
});

export const createExternalStoreReturn = asyncHandler(async (req, res) => {
  const product = await findProduct({
    productId: String(req.body?.productId || "").trim(),
    productCode: String(req.body?.productCode || "").trim(),
    barcode: String(req.body?.barcode || "").trim(),
  });
  if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

  const qty = roundMoney(Number(req.body?.quantity));
  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ message: "Qaytarish soni 0 dan katta bo'lishi kerak" });
  }

  const sourceRequestId = String(req.body?.sourceRequestId || "").trim();
  const sourceStoreCode = String(req.body?.sourceStoreCode || "").trim();
  if (sourceRequestId) {
    const existing = await StoreReturnRequest.findOne({ sourceRequestId, sourceStoreCode, status: "pending" });
    if (existing) return res.json({ request: existing, duplicated: true });
  }

  const request = await StoreReturnRequest.create({
    productId: product._id,
    productName: product.name,
    productBarcode: product.barcode || "",
    unit: String(req.body?.unit || product.unit || "dona"),
    requestedQty: qty,
    requestNote: String(req.body?.requestNote || req.body?.note || "").trim(),
    sourceRequestId,
    sourceStoreCode,
    sourceStoreName: String(req.body?.sourceStoreName || "").trim(),
    requestedByUsername: String(req.body?.requestedByUsername || req.user?.username || "kassa").trim(),
    requestedAt: new Date(),
  });

  return res.status(201).json({ request });
});

export const approveStoreReturn = asyncHandler(async (req, res) => {
  const request = await StoreReturnRequest.findOne({ _id: req.params.id, status: "pending" });
  if (!request) return res.status(404).json({ message: "Kutilayotgan qaytarish so'rovi topilmadi" });

  const product = await Product.findById(request.productId);
  if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

  const qty = roundMoney(Number(request.requestedQty || 0));
  product.quantity = roundMoney(Number(product.quantity || 0) + qty);
  await product.save();

  request.status = "approved";
  request.approvedQty = qty;
  request.decisionNote = String(req.body?.note || "").trim();
  request.approvedByUsername = String(req.user?.username || "admin");
  request.approvedAt = new Date();
  await request.save();

  return res.json({ request, product: { id: product._id, quantity: product.quantity } });
});

export const rejectStoreReturn = asyncHandler(async (req, res) => {
  const request = await StoreReturnRequest.findOne({ _id: req.params.id, status: "pending" });
  if (!request) return res.status(404).json({ message: "Kutilayotgan qaytarish so'rovi topilmadi" });

  request.status = "rejected";
  request.decisionNote = String(req.body?.note || "").trim();
  request.approvedByUsername = String(req.user?.username || "admin");
  request.approvedAt = new Date();
  request.approvedQty = 0;
  await request.save();

  return res.json({ request });
});

export const acceptStoreReturn = asyncHandler(async (req, res) => {
  const product = await findProduct({
    productId: String(req.body?.productId || "").trim(),
    productCode: String(req.body?.productCode || "").trim(),
    barcode: String(req.body?.barcode || "").trim(),
  });
  if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

  const qty = roundMoney(Number(req.body?.quantity));
  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ message: "Qaytarish soni 0 dan katta bo'lishi kerak" });
  }

  product.quantity = roundMoney(Number(product.quantity || 0) + qty);
  await product.save();

  return res.json({ ok: true, product: { id: product._id, quantity: product.quantity } });
});
