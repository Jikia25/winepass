-- ============================================================
-- WinePass — Phase 1 seed: 10 real Bordeaux châteaux + bundles
--
-- This has already been applied to the live project
-- (bhpcmfghmfvzaxfjsbfp) via the Supabase REST API using the
-- service role key. This file documents that seed as idempotent
-- SQL so it can be re-run (e.g. on a fresh project) and so the
-- data is reviewable/version-controlled.
--
-- Appellations referenced: medoc, saint-emilion, graves-pessac,
-- sauternes, pomerol, entre-deux-mers (all already exist).
--
-- price_min/price_max are NOT columns — "from €X" is computed
-- as MIN(bundles.price) per château at query time.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- A. Châteaux (3 enriched + 7 new, upserted by slug)
-- ────────────────────────────────────────────────────────────

insert into chateaux (
  slug, name, appellation_id, tier,
  description_en, description_fr, description_de,
  lat, lng, address, distance_km,
  wine_styles, grape_varieties, languages,
  avg_rating, review_count, is_active,
  open_days, open_time, close_time,
  photo_url, color_hex, awards,
  is_sustainable, is_organic, free_cancellation
) values
  -- ── Existing — enriched with lat/lng, address, FR description, photo ──
  (
    'chateau-bernateau', 'Château Bernateau',
    (select id from appellations where slug = 'saint-emilion'), 'grand_cru',
    'Family estate in the heart of Saint-Émilion. Since 1897, aging Merlot 85% in limestone cellars. 2024 Best Sustainable Practices winner.',
    'Domaine familial au cœur de Saint-Émilion. Depuis 1897, élevage de Merlot à 85 % en chais de calcaire. Lauréat 2024 du prix des meilleures pratiques durables.',
    null,
    44.8838, -0.0958, 'Lieu-dit Bernateau, 33330 Saint-Étienne-de-Lisse, France', 45,
    array['red'], array['Merlot','Cabernet Franc'], array['en','fr','de'],
    4.8, 737, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1761489179799-c8ecad6ec719?auto=format&fit=crop&w=1600&q=80', '7A2424', array[]::text[],
    true, false, true
  ),
  (
    'chateau-la-garde', 'Château La Garde',
    (select id from appellations where slug = 'graves-pessac'), 'grand_cru',
    'Just 15km from Bordeaux. Exceptional red and white wines from Pessac-Léognan. 2025 Best of Bordeaux Wine Tourism winner.',
    'À seulement 15 km de Bordeaux. Vins rouges et blancs d''exception de Pessac-Léognan. Lauréat 2025 du prix du meilleur œnotourisme de Bordeaux.',
    null,
    44.7180, -0.5210, '1 Chemin de la Tuilerie, 33650 Martillac, France', 15,
    array['red','white'], array['Cabernet Sauvignon','Sauvignon Blanc'], array['en','fr','de','es'],
    4.7, 512, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1696583536539-a37eb2e93080?auto=format&fit=crop&w=1600&q=80', '2E6B3E', array[]::text[],
    false, false, true
  ),
  (
    'chateau-mauvinon', 'Château Mauvinon',
    (select id from appellations where slug = 'saint-emilion'), 'grand_cru',
    'Biodynamic estate with a commitment to zero-pesticide viticulture. 2024 Regional Best Sustainable Practices Award.',
    'Domaine en biodynamie, engagé pour une viticulture sans pesticides. Prix régional 2024 des meilleures pratiques durables.',
    null,
    44.8800, -0.0920, 'Lieu-dit Mauvinon, 33330 Saint-Étienne-de-Lisse, France', 45,
    array['red'], array['Merlot','Cabernet Franc'], array['en','fr'],
    4.6, 289, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1758315449185-8c4bd0ae6487?auto=format&fit=crop&w=1600&q=80', '7A2424', array[]::text[],
    true, false, true
  ),

  -- ── New ──────────────────────────────────────────────────────────────
  (
    'chateau-lynch-bages', 'Château Lynch-Bages',
    (select id from appellations where slug = 'medoc'), 'grand_cru_classe',
    'Fifth Grand Cru Classé in Pauillac, owned by the Cazes family. Tour the cellars, taste flagship Cabernet-dominant blends, and dine at the estate''s famous wine bar.',
    'Cinquième Grand Cru Classé de Pauillac, propriété de la famille Cazes. Visitez les chais, dégustez les grands vins à dominante Cabernet et dînez au célèbre bar à vin du domaine.',
    null,
    45.1940, -0.7560, 'Le Pouyalet, 33250 Pauillac, France', 55,
    array['red'], array['Cabernet Sauvignon','Merlot','Cabernet Franc','Petit Verdot'], array['en','fr','de','es'],
    4.9, 1024, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1618817693467-05e3a60da7bf?auto=format&fit=crop&w=1600&q=80', '5C1A1A', array[]::text[],
    true, false, true
  ),
  (
    'chateau-lanessan', 'Château Lanessan',
    (select id from appellations where slug = 'medoc'), 'cru_bourgeois',
    'Cru Bourgeois estate overlooking the Gironde estuary, famous for its 19th-century stables and horse-drawn carriage museum. Family-run since 1793.',
    'Domaine Cru Bourgeois dominant l''estuaire de la Gironde, célèbre pour ses écuries du XIXe siècle et son musée des calèches. Propriété familiale depuis 1793.',
    null,
    45.1190, -0.7280, '33460 Cussac-Fort-Médoc, France', 35,
    array['red'], array['Cabernet Sauvignon','Merlot','Petit Verdot'], array['en','fr'],
    4.5, 312, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1771003602160-4e32dd69e575?auto=format&fit=crop&w=1600&q=80', '5C1A1A', array[]::text[],
    false, false, true
  ),
  (
    'chateau-de-sales', 'Château de Sales',
    (select id from appellations where slug = 'pomerol'), 'grand_cru',
    'The largest estate in Pomerol, in the same family since the 18th century. A Merlot-dominant château with a 17th-century manor surrounded by vines.',
    'Le plus grand domaine de Pomerol, dans la même famille depuis le XVIIIe siècle. Un château à dominante Merlot avec un manoir du XVIIe siècle entouré de vignes.',
    null,
    44.9280, -0.1980, 'Chemin de Sales, 33500 Pomerol, France', 48,
    array['red'], array['Merlot','Cabernet Franc','Cabernet Sauvignon'], array['en','fr'],
    4.7, 198, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1759064971900-8f46c1a1fc3a?auto=format&fit=crop&w=1600&q=80', '3D3D8A', array[]::text[],
    false, false, true
  ),
  (
    'chateau-guiraud', 'Château Guiraud',
    (select id from appellations where slug = 'sauternes'), 'grand_cru_classe',
    'Premier Cru Classé estate and pioneer of organic viticulture in Sauternes. Walk the noble-rot vineyards and taste golden, honeyed botrytis wines.',
    'Premier Cru Classé et pionnier de la viticulture biologique à Sauternes. Promenade dans les vignes touchées par la pourriture noble et dégustation de vins liquoreux dorés et miellés.',
    null,
    44.5380, -0.3550, '33210 Sauternes, France', 60,
    array['sweet','white'], array['Sémillon','Sauvignon Blanc','Muscadelle'], array['en','fr'],
    4.8, 245, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1763786470676-6cc83e519a0f?auto=format&fit=crop&w=1600&q=80', '854F0B', array[]::text[],
    true, true, true
  ),
  (
    'chateau-bauduc', 'Château Bauduc',
    (select id from appellations where slug = 'entre-deux-mers'), 'standard',
    'English-owned family estate in Entre-Deux-Mers, known for crisp Sauvignon Blanc whites and friendly tastings in a converted barn.',
    'Domaine familial d''origine anglaise en Entre-Deux-Mers, réputé pour ses blancs vifs de Sauvignon et ses dégustations conviviales dans une grange rénovée.',
    null,
    44.7700, -0.3450, '76 Route de Branne, 33670 Créon, France', 28,
    array['white','red'], array['Sauvignon Blanc','Sémillon','Merlot','Cabernet Sauvignon'], array['en','fr'],
    4.6, 167, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1602574923858-a5b496e2d0d5?auto=format&fit=crop&w=1600&q=80', '2E5C5C', array[]::text[],
    true, false, true
  ),
  (
    'chateau-smith-haut-lafitte', 'Château Smith Haut Lafitte',
    (select id from appellations where slug = 'graves-pessac'), 'grand_cru_classe',
    'Cru Classé estate famous for biodynamic viticulture and the Caudalie vinotherapy spa. Tour the barrel cellar shaped like an upturned hull and taste both red and white Grand Vin.',
    'Cru Classé réputé pour sa viticulture en biodynamie et le spa de vinothérapie Caudalie. Visitez le chai en forme de coque de bateau renversée et dégustez les grands vins rouge et blanc.',
    null,
    44.7220, -0.5280, '33650 Martillac, France', 16,
    array['red','white'], array['Cabernet Sauvignon','Merlot','Sauvignon Blanc','Sémillon'], array['en','fr','de','es'],
    4.9, 876, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1639757664366-83a495f4a9d9?auto=format&fit=crop&w=1600&q=80', '2E6B3E', array[]::text[],
    true, false, true
  ),
  (
    'chateau-de-pressac', 'Château de Pressac',
    (select id from appellations where slug = 'saint-emilion'), 'grand_cru',
    'Medieval fortress where the end of the Hundred Years'' War was negotiated in 1453. Tour the château and cellars, then dine at the on-site restaurant overlooking Saint-Émilion.',
    'Forteresse médiévale où fut négociée la fin de la guerre de Cent Ans en 1453. Visitez le château et les chais, puis dînez au restaurant du domaine avec vue sur Saint-Émilion.',
    null,
    44.8520, -0.0680, 'Lieu-dit Pressac, 33330 Saint-Étienne-de-Lisse, France', 45,
    array['red'], array['Merlot','Cabernet Franc','Cabernet Sauvignon','Carmenère'], array['en','fr'],
    4.7, 421, true,
    array[]::text[], '10:00:00', '17:00:00',
    'https://images.unsplash.com/photo-1761184880887-da352e3d5142?auto=format&fit=crop&w=1600&q=80', '7A2424', array[]::text[],
    false, false, true
  )
on conflict (slug) do update set
  appellation_id  = excluded.appellation_id,
  tier            = excluded.tier,
  description_en  = excluded.description_en,
  description_fr  = excluded.description_fr,
  description_de  = excluded.description_de,
  lat             = excluded.lat,
  lng             = excluded.lng,
  address         = excluded.address,
  distance_km     = excluded.distance_km,
  wine_styles     = excluded.wine_styles,
  grape_varieties = excluded.grape_varieties,
  languages       = excluded.languages,
  avg_rating      = excluded.avg_rating,
  review_count    = excluded.review_count,
  photo_url       = excluded.photo_url,
  color_hex       = excluded.color_hex,
  is_sustainable  = excluded.is_sustainable,
  is_organic      = excluded.is_organic,
  free_cancellation = excluded.free_cancellation,
  updated_at      = now();

-- ────────────────────────────────────────────────────────────
-- B. Bundles (Basic / Classic / Premium) for the 9 châteaux
--    that didn't have any yet. chateau-bernateau already has
--    its 3 bundles (65 / 85 / 140) — left untouched.
--    Guarded with NOT EXISTS since (chateau_id, name) has no
--    unique constraint on the live table yet.
-- ────────────────────────────────────────────────────────────

insert into bundles (
  chateau_id, name, price,
  includes_tasting, includes_transport, includes_lunch,
  includes_guide, includes_second_ch, includes_dinner,
  tasting_wines, max_persons, duration_hours,
  description_en, description_fr, is_active
)
select v.chateau_id, v.name, v.price,
       v.includes_tasting, v.includes_transport, v.includes_lunch,
       v.includes_guide, v.includes_second_ch, v.includes_dinner,
       v.tasting_wines, v.max_persons, v.duration_hours,
       v.description_en, v.description_fr, true
from (values
  -- Château La Garde
  ((select id from chateaux where slug='chateau-la-garde'), 'basic',   60,  true, true, false, false, false, false, 2, 20, 1.5,
    'Pessac-Léognan tasting (2 wines, red & white) + return transport from Bordeaux (15 min).',
    'Dégustation Pessac-Léognan (2 vins, rouge et blanc) + transport aller-retour depuis Bordeaux (15 min).'),
  ((select id from chateaux where slug='chateau-la-garde'), 'classic', 80,  true, true, true,  true,  false, false, 3, 20, 3.0,
    'Pessac-Léognan tasting (3 wines) + transport + light lunch + cheese board + English-speaking guide.',
    'Dégustation Pessac-Léognan (3 vins) + transport + déjeuner léger + plateau de fromages + guide anglophone.'),
  ((select id from chateaux where slug='chateau-la-garde'), 'premium', 130, true, true, true,  true,  true,  true,  4, 20, 5.0,
    'Private tasting (4 wines incl. barrel sample) + 2nd château visit + transport + gourmet dinner pairing + private guide.',
    'Dégustation privée (4 vins dont un échantillon de fût) + visite d''un 2e château + transport + dîner gastronomique accordé + guide privé.'),

  -- Château Mauvinon
  ((select id from chateaux where slug='chateau-mauvinon'), 'basic',   55,  true, true, false, false, false, false, 2, 20, 2.0,
    'Biodynamic Saint-Émilion tasting (2 wines) + return transport from Bordeaux.',
    'Dégustation biodynamique de Saint-Émilion (2 vins) + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-mauvinon'), 'classic', 75,  true, true, true,  true,  false, false, 3, 20, 3.5,
    'Biodynamic tasting (3 wines) + vineyard walk + light lunch + cheese board + guide.',
    'Dégustation biodynamique (3 vins) + promenade dans les vignes + déjeuner léger + plateau de fromages + guide.'),
  ((select id from chateaux where slug='chateau-mauvinon'), 'premium', 120, true, true, true,  true,  true,  true,  4, 20, 5.0,
    'Private tasting (4 wines incl. a barrel sample) + 2nd château visit + transport + gourmet dinner pairing + private guide.',
    'Dégustation privée (4 vins dont un échantillon de fût) + visite d''un 2e château + transport + dîner gastronomique accordé + guide privé.'),

  -- Château Lynch-Bages
  ((select id from chateaux where slug='chateau-lynch-bages'), 'basic',   75,  true, true, false, false, false, false, 2, 20, 2.0,
    'Pauillac tasting (2 wines incl. the Grand Vin) + return transport from Bordeaux.',
    'Dégustation à Pauillac (2 vins dont le Grand Vin) + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-lynch-bages'), 'classic', 110, true, true, true,  true,  false, false, 3, 20, 3.5,
    'Tasting (3 wines incl. the Grand Vin) + cellar tour + light lunch + cheese board + guide (EN/FR/DE/ES).',
    'Dégustation (3 vins dont le Grand Vin) + visite des chais + déjeuner léger + plateau de fromages + guide (EN/FR/DE/ES).'),
  ((select id from chateaux where slug='chateau-lynch-bages'), 'premium', 195, true, true, true,  true,  true,  true,  4, 20, 5.5,
    'Vertical tasting (4 wines incl. a library vintage) + visit to a 2nd Pauillac château + transport + dinner at the estate''s wine bar + private guide.',
    'Dégustation verticale (4 vins dont un millésime de cave) + visite d''un 2e château de Pauillac + transport + dîner au bar à vin du domaine + guide privé.'),

  -- Château Lanessan
  ((select id from chateaux where slug='chateau-lanessan'), 'basic',   50,  true, true, false, false, false, false, 2, 20, 2.0,
    'Haut-Médoc tasting (2 wines) + horse-drawn carriage museum + return transport from Bordeaux.',
    'Dégustation Haut-Médoc (2 vins) + musée des calèches + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-lanessan'), 'classic', 70,  true, true, true,  true,  false, false, 3, 20, 3.5,
    'Tasting (3 wines) + cellar & stables tour + light lunch + cheese board + guide.',
    'Dégustation (3 vins) + visite des chais et des écuries + déjeuner léger + plateau de fromages + guide.'),
  ((select id from chateaux where slug='chateau-lanessan'), 'premium', 115, true, true, true,  true,  true,  true,  4, 20, 5.0,
    'Private tasting (4 wines incl. a barrel sample) + 2nd château visit + transport + gourmet dinner pairing + private guide.',
    'Dégustation privée (4 vins dont un échantillon de fût) + visite d''un 2e château + transport + dîner gastronomique accordé + guide privé.'),

  -- Château de Sales
  ((select id from chateaux where slug='chateau-de-sales'), 'basic',   70,  true, true, false, false, false, false, 2, 20, 2.0,
    'Pomerol tasting (2 wines) + manor grounds walk + return transport from Bordeaux.',
    'Dégustation Pomerol (2 vins) + promenade dans le parc du manoir + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-de-sales'), 'classic', 95,  true, true, true,  true,  false, false, 3, 20, 3.5,
    'Tasting (3 wines) + cellar tour + light lunch + cheese board + guide.',
    'Dégustation (3 vins) + visite des chais + déjeuner léger + plateau de fromages + guide.'),
  ((select id from chateaux where slug='chateau-de-sales'), 'premium', 165, true, true, true,  true,  true,  true,  4, 20, 5.5,
    'Private tasting (4 wines incl. a barrel sample) + 2nd Pomerol château visit + transport + gourmet dinner pairing + private guide.',
    'Dégustation privée (4 vins dont un échantillon de fût) + visite d''un 2e château de Pomerol + transport + dîner gastronomique accordé + guide privé.'),

  -- Château Guiraud
  ((select id from chateaux where slug='chateau-guiraud'), 'basic',   45,  true, true, false, false, false, false, 2, 20, 1.5,
    'Sauternes tasting (2 sweet wines) + noble-rot vineyard walk + return transport from Bordeaux.',
    'Dégustation Sauternes (2 vins liquoreux) + promenade dans les vignes de pourriture noble + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-guiraud'), 'classic', 65,  true, true, true,  true,  false, false, 3, 20, 3.0,
    'Tasting (3 sweet wines) + organic vineyard tour + light lunch with foie gras pairing + guide.',
    'Dégustation (3 vins liquoreux) + visite du vignoble biologique + déjeuner léger accordé au foie gras + guide.'),
  ((select id from chateaux where slug='chateau-guiraud'), 'premium', 110, true, true, true,  true,  true,  true,  4, 20, 5.0,
    'Private tasting (4 wines incl. a rare vintage) + 2nd Sauternes château visit + transport + gourmet dinner pairing + private guide.',
    'Dégustation privée (4 vins dont un millésime rare) + visite d''un 2e château de Sauternes + transport + dîner gastronomique accordé + guide privé.'),

  -- Château Bauduc
  ((select id from chateaux where slug='chateau-bauduc'), 'basic',   35,  true, true, false, false, false, false, 2, 20, 1.5,
    'Entre-Deux-Mers tasting (2 wines, white & red) in the converted barn + return transport from Bordeaux.',
    'Dégustation Entre-Deux-Mers (2 vins, blanc et rouge) dans la grange rénovée + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-bauduc'), 'classic', 50,  true, true, true,  true,  false, false, 3, 20, 3.0,
    'Tasting (3 wines) + vineyard walk + light lunch + cheese board + English-speaking guide.',
    'Dégustation (3 vins) + promenade dans les vignes + déjeuner léger + plateau de fromages + guide anglophone.'),
  ((select id from chateaux where slug='chateau-bauduc'), 'premium', 85,  true, true, true,  true,  true,  true,  4, 20, 4.5,
    'Private tasting (4 wines incl. a barrel sample) + 2nd château visit + transport + gourmet dinner pairing + private guide.',
    'Dégustation privée (4 vins dont un échantillon de fût) + visite d''un 2e château + transport + dîner gastronomique accordé + guide privé.'),

  -- Château Smith Haut Lafitte
  ((select id from chateaux where slug='chateau-smith-haut-lafitte'), 'basic',   80,  true, true, false, false, false, false, 2, 20, 2.0,
    'Cru Classé tasting (2 wines, red & white) + return transport from Bordeaux.',
    'Dégustation Cru Classé (2 vins, rouge et blanc) + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-smith-haut-lafitte'), 'classic', 120, true, true, true,  true,  false, false, 3, 20, 3.5,
    'Tasting (3 wines) + biodynamic vineyard tour + light lunch + cheese board + guide (EN/FR/DE/ES).',
    'Dégustation (3 vins) + visite du vignoble en biodynamie + déjeuner léger + plateau de fromages + guide (EN/FR/DE/ES).'),
  ((select id from chateaux where slug='chateau-smith-haut-lafitte'), 'premium', 220, true, true, true,  true,  false, true,  4, 20, 6.0,
    'Private tasting (4 wines incl. a barrel sample) + access to the Caudalie vinotherapy spa + transport + gourmet dinner pairing + private guide.',
    'Dégustation privée (4 vins dont un échantillon de fût) + accès au spa de vinothérapie Caudalie + transport + dîner gastronomique accordé + guide privé.'),

  -- Château de Pressac
  ((select id from chateaux where slug='chateau-de-pressac'), 'basic',   50,  true, true, false, false, false, false, 2, 20, 2.0,
    'Saint-Émilion tasting (2 wines) + medieval fortress tour + return transport from Bordeaux.',
    'Dégustation Saint-Émilion (2 vins) + visite de la forteresse médiévale + transport aller-retour depuis Bordeaux.'),
  ((select id from chateaux where slug='chateau-de-pressac'), 'classic', 75,  true, true, true,  true,  false, false, 3, 20, 3.5,
    'Tasting (3 wines) + château & cellar tour + light lunch + cheese board + guide.',
    'Dégustation (3 vins) + visite du château et des chais + déjeuner léger + plateau de fromages + guide.'),
  ((select id from chateaux where slug='chateau-de-pressac'), 'premium', 130, true, true, true,  true,  true,  true,  4, 20, 5.5,
    'Private tasting (4 wines incl. a barrel sample) + 2nd château visit + transport + dinner at the on-site restaurant + private guide.',
    'Dégustation privée (4 vins dont un échantillon de fût) + visite d''un 2e château + transport + dîner au restaurant du domaine + guide privé.')
) as v(chateau_id, name, price, includes_tasting, includes_transport, includes_lunch,
       includes_guide, includes_second_ch, includes_dinner, tasting_wines, max_persons,
       duration_hours, description_en, description_fr)
where not exists (
  select 1 from bundles b where b.chateau_id = v.chateau_id and b.name = v.name
);
