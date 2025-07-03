create policy "Allow authenticated users to delete CVs"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'cvs'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated users to delete cover letters"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'cover_letters'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated users to update CVs"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'cvs'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated users to update cover letters"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'cover_letters'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated users to upload CVs"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'cvs'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated users to upload cover letters"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'cover_letters'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated users to view CVs"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'cvs'::text) AND (auth.uid() = owner)));


create policy "Allow authenticated users to view cover letters"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'cover_letters'::text) AND (auth.uid() = owner)));



