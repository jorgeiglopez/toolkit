# Rails

## Look at

- `Gemfile` + `Gemfile.lock` — dependencies, Ruby version, Rails version.
- `.ruby-version`, `.tool-versions`.
- `config/application.rb`, `config/environments/*.rb`, `config/routes.rb`.
- `config/database.yml` — adapter, pool, env-specific overrides.
- `bin/setup`, `bin/dev`, `Procfile.dev` — local run scripts.

## Layout

- `app/models/`, `app/controllers/`, `app/views/`, `app/jobs/`, `app/mailers/`, `app/services/` (custom).
- `app/javascript/` or `app/frontend/` — Importmap, esbuild, Vite, or Webpacker.
- Engines under `engines/` or `gems/`.

## DB

- `db/schema.rb` (or `db/structure.sql`) — current schema state.
- `db/migrate/` — newest filenames show recent schema work. Diff `db/schema.rb` vs latest migration to spot uncommitted migrations.
- `db/seeds.rb`.

## Tests

- `spec/` (RSpec) or `test/` (Minitest).
- Skipped: `grep -rIn -E '\b(xit|xdescribe|skip\s*[\(\{"])' spec/ test/ 2>/dev/null`.
- Fixtures vs factories: `spec/factories/`, `test/fixtures/`.

## Background + cache

- ActiveJob backend: check `config/application.rb` (`config.active_job.queue_adapter`). Look for Sidekiq, Resque, GoodJob, SolidQueue.
- Cache store: `config/environments/production.rb`.

## Run

- `bin/rails server`, `bin/rails console`, `bin/rails db:migrate` — don't run, just note.
