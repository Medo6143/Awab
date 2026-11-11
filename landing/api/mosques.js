// Mosques around a point, for the app's «أقرب مسجد». The app cannot reach Overpass from many
// Egyptian networks (every public server is blocked or refuses), so it asks here and this
// function asks Overpass from Vercel. Nothing is stored or logged; the app already rounds the
// position to about 100 m, and the answer is cached at the edge for a day per point.
//   GET /api/mosques?lat=30.044&lon=31.236  →  { elements: [{ type, id, lat, lon, tags }] }
const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const RADIUS_M = 3000;

module.exports = async (req, res) => {
  const lat = Number(req.query.lat), lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    res.status(400).json({ error: 'lat and lon are required' });
    return;
  }
  const r = (n) => Math.round(n * 1000) / 1000;
  const around = `(around:${RADIUS_M},${r(lat)},${r(lon)})`;
  const f = '["amenity"="place_of_worship"]["religion"="muslim"]';
  const query = `[out:json][timeout:20];(node${f}${around};way${f}${around};relation${f}${around};);out center 80;`;

  const tried = [];
  for (const url of SERVERS) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 9000);
      const out = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Owwab/1.0 (+https://owwab.vercel.app)' },
        body: 'data=' + encodeURIComponent(query),
        signal: ctl.signal,
      }).finally(() => clearTimeout(timer));
      if (!out.ok) { tried.push(`${url} ${out.status}`); continue; }
      const data = await out.json();
      const elements = (data.elements || []).map((e) => ({
        type: e.type, id: e.id,
        lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon,
        tags: e.tags ? { name: e.tags.name, 'name:ar': e.tags['name:ar'] } : undefined,
      }));
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      res.status(200).json({ elements, remark: data.remark });
      return;
    } catch (e) {
      tried.push(`${url} ${e.name}`); // try the next server
    }
  }
  res.status(502).json({ error: 'overpass unavailable', tried });
};
