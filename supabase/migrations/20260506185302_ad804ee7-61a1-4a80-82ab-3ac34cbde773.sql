UPDATE cost_modules
SET rows = (
  SELECT jsonb_agg(
    CASE
      WHEN row_data->>0 = 'Kit camera' THEN row_data
      ELSE jsonb_build_array(
        row_data->>0,
        row_data->>1,
        ROUND((COALESCE(NULLIF(row_data->>1,'')::numeric, 0) * 0.035))::text
      )
    END
    ORDER BY idx
  )
  FROM jsonb_array_elements(rows) WITH ORDINALITY AS t(row_data, idx)
)
WHERE module_key = 'equipos_av';