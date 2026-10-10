-- Independent notebook rows. Progress/XP/streak storage is unchanged.
create table if not exists public.math_notebooks (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (id ~ '^[a-zA-Z0-9_-]{1,80}$'),
  revision bigint not null default 1 check (revision > 0),
  document jsonb not null check (octet_length(document::text) <= 1000000 and jsonb_typeof(document) = 'object' and document ? 'version' and document ? 'id' and document->'version' = '1'::jsonb and document->>'id' = id),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.math_notebooks enable row level security;
create policy "Owners read notebooks" on public.math_notebooks for select to authenticated using ((select auth.uid()) = user_id);
-- Only the revision-checked function can write. No direct client insert/update grants.
revoke all on public.math_notebooks from anon, authenticated;
grant select on public.math_notebooks to authenticated;

create or replace function public.save_math_notebook(notebook_id text, expected_revision bigint, contents jsonb, owner_id uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare next_revision bigint;
begin
  if auth.uid() is null or owner_id is distinct from auth.uid() then raise exception 'Authentication required'; end if;
  if expected_revision < 0 then raise exception 'Invalid revision'; end if;
  if expected_revision = 0 then
    insert into public.math_notebooks(user_id,id,revision,document) values (auth.uid(),notebook_id,1,contents)
    on conflict do nothing returning revision into next_revision;
  else
    update public.math_notebooks set document = contents, revision = revision + 1, updated_at = now()
    where user_id = auth.uid() and id = notebook_id and revision = expected_revision
    returning revision into next_revision;
  end if;
  return next_revision; -- NULL signals a conflict; preserve the local copy.
end;
$$;
revoke all on function public.save_math_notebook(text,bigint,jsonb,uuid) from public, anon;
grant execute on function public.save_math_notebook(text,bigint,jsonb,uuid) to authenticated;
