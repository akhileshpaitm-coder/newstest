import Ad from "../models/Ad";
import AdAnalytics from "../models/AdAnalytics";

// ── Admin CRUD ──────────────────────────────────────────────────────────────

export const getAds = async (_req: any, res: any) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createAd = async (req: any, res: any) => {
  try {
    const { title, imageUrl, targetLink, category, active } = req.body;
    const ad = await Ad.create({ title, imageUrl, targetLink, category, active });
    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAd = async (req: any, res: any) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAd = async (req: any, res: any) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    res.json({ message: "Ad deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── Campaign Stats ───────────────────────────────────────────────────────────

export const getCampaignStats = async (_req: any, res: any) => {
  try {
    const ads = await Ad.find();

    const stats = await Promise.all(
      ads.map(async (ad) => {
        const [totalViews, totalClicks] = await Promise.all([
          AdAnalytics.countDocuments({ ad: ad._id, viewed: true }),
          AdAnalytics.countDocuments({ ad: ad._id, clicked: true })
        ]);
        const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";
        return {
          ad: { id: ad._id, title: ad.title, active: ad.active, imageUrl: ad.imageUrl },
          totalViews,
          totalClicks,
          ctr: `${ctr}%`
        };
      })
    );

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── User Tracking ────────────────────────────────────────────────────────────

export const trackView = async (req: any, res: any) => {
  try {
    const { adId } = req.body;
    await AdAnalytics.updateOne(
      { ad: adId, user: req.user.id },
      { $set: { viewed: true } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const trackClick = async (req: any, res: any) => {
  try {
    const { adId } = req.body;
    await AdAnalytics.updateOne(
      { ad: adId, user: req.user.id },
      { $set: { clicked: true } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
