-- ========================================================
-- FASE 5: OPTIMIZACIÓN Y TIEMPO REAL
-- Por favor, corre esto en el SQL Editor de tu Supabase
-- ========================================================

-- 1. Habilitar Tiempo Real para la tabla matches
-- Esto permite que los clientes escuchen cambios en los resultados sin refrescar la página.
alter table public.matches replica identity full;

begin;
  -- Remover publicación si ya existe y recrear
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.matches;

-- ========================================================
-- 2. Materialized View para el Ranking (Optimización)
-- ========================================================

-- Si ya existe una vista tradicional, la tiramos (opcional, cuidado si dependés de ella)
-- DROP VIEW IF EXISTS public.user_standings;

-- Creamos la función que calcula los puntos (3 por exacto, 1 por ganador/empate)
CREATE OR REPLACE FUNCTION calculate_match_points(
    pred_home integer, pred_away integer, 
    match_home integer, match_away integer
) RETURNS integer AS $$
BEGIN
    IF pred_home = match_home AND pred_away = match_away THEN
        RETURN 3;
    ELSIF (pred_home > pred_away AND match_home > match_away) OR 
          (pred_home < pred_away AND match_home < match_away) OR 
          (pred_home = pred_away AND match_home = match_away) THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Creamos la Vista Materializada
DROP MATERIALIZED VIEW IF EXISTS public.user_standings_mv;

CREATE MATERIALIZED VIEW public.user_standings_mv AS
SELECT 
    u.id AS user_id,
    u.username,
    COALESCE(SUM(
        calculate_match_points(p.home_score, p.away_score, m.home_score, m.away_score)
    ), 0) AS points,
    COALESCE(SUM(
        CASE WHEN p.home_score = m.home_score AND p.away_score = m.away_score THEN 1 ELSE 0 END
    ), 0) AS exact_results,
    COUNT(p.id) AS total_predictions,
    RANK() OVER (
        ORDER BY 
            COALESCE(SUM(calculate_match_points(p.home_score, p.away_score, m.home_score, m.away_score)), 0) DESC,
            COALESCE(SUM(CASE WHEN p.home_score = m.home_score AND p.away_score = m.away_score THEN 1 ELSE 0 END), 0) DESC,
            COUNT(p.id) ASC
    ) as rank
FROM public.profiles u
LEFT JOIN public.predictions p ON u.id = p.user_id
LEFT JOIN public.matches m ON p.match_id = m.id AND m.status = 'finished'
GROUP BY u.id, u.username;

-- Creamos un índice para búsquedas ultra rápidas por usuario o rango
CREATE UNIQUE INDEX idx_user_standings_mv_user_id ON public.user_standings_mv(user_id);
CREATE INDEX idx_user_standings_mv_rank ON public.user_standings_mv(rank);

-- ========================================================
-- 3. Automatización: Refrescar la Vista al cambiar un partido
-- ========================================================

CREATE OR REPLACE FUNCTION refresh_user_standings()
RETURNS trigger AS $$
BEGIN
  -- Solo refrescar si cambió el status a finished o cambiaron los goles
  IF TG_OP = 'UPDATE' AND 
     ((NEW.status = 'finished' AND OLD.status != 'finished') OR 
      (NEW.home_score IS DISTINCT FROM OLD.home_score) OR 
      (NEW.away_score IS DISTINCT FROM OLD.away_score)) THEN
    
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_standings_mv;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refresh_standings ON public.matches;

CREATE TRIGGER trigger_refresh_standings
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION refresh_user_standings();

-- ========================================================
-- Fin del Script
-- ========================================================
