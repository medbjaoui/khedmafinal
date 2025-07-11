SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '31b5ef8d-6703-4180-a589-ce8f287ae7f5', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 10:32:08.497394+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a08d1c5-d5e1-4341-962b-70e7dcfca3ae', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 10:32:19.443115+00', ''),
	('00000000-0000-0000-0000-000000000000', '2ee08e8f-0c60-46fd-bc04-d146d88a1314', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000002","actor_username":"ahmed.benali@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 10:32:23.100051+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ca5ba698-192a-4dfa-be10-02f1d3080cbc', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000002","actor_username":"ahmed.benali@email.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 10:33:18.178501+00', ''),
	('00000000-0000-0000-0000-000000000000', '29be6ef8-7377-4b60-b808-88a044228f75', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 10:33:21.776756+00', ''),
	('00000000-0000-0000-0000-000000000000', '058f50f3-6b93-4d3f-97e1-c7956e1e3757', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 10:33:35.555446+00', ''),
	('00000000-0000-0000-0000-000000000000', '401a7a84-a17e-4a37-a14d-16be49c8161c', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 10:33:39.907895+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd376e4ca-80ff-469d-a171-a8616e452207', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 10:51:38.516891+00', ''),
	('00000000-0000-0000-0000-000000000000', '1a7204b6-5e24-435e-93cc-f72db08681f4', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 10:51:44.535023+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b52b9710-b01f-4c70-9486-96a2d9777b55', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 10:52:50.302448+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fed7f3c7-81c9-45de-b20c-32b31d8ca284', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 10:52:55.402653+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a4ca06f-82d9-4cc2-a851-c455faf90e81', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 10:59:53.15967+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea1f3cd4-e896-4e62-8b21-862a58ab93c3', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 10:59:57.958356+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ecf9e239-1119-4d5f-9077-735b36b4aadc', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 11:06:22.371608+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd57b8284-a80f-47d0-ac75-f638efb83b3d', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 11:07:52.645651+00', ''),
	('00000000-0000-0000-0000-000000000000', '30d6002e-96f4-474c-86df-da9925cbce5a', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 11:19:48.314909+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bfc4da66-28ae-4902-8bee-1b184c908938', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000002","actor_username":"ahmed.benali@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 11:19:52.383649+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bdd57ce2-1a53-4627-b236-b6d9534dbb55', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000002","actor_username":"ahmed.benali@email.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 11:20:00.095347+00', ''),
	('00000000-0000-0000-0000-000000000000', '6501a03a-70dd-49e6-889c-28c45a71fc0b', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 11:30:21.319877+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4584bd0-b021-438d-8eab-1b449fc11d60', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 11:37:56.405934+00', ''),
	('00000000-0000-0000-0000-000000000000', '91340da5-a78f-4559-a918-7c48beb07f04', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 11:38:00.697645+00', ''),
	('00000000-0000-0000-0000-000000000000', '37bf5d1d-ef59-49b6-8a90-36c407b8f115', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 12:36:49.752641+00', ''),
	('00000000-0000-0000-0000-000000000000', '48ca1d96-757b-4c59-8227-5fd5e66def65', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 12:36:49.755012+00', ''),
	('00000000-0000-0000-0000-000000000000', '88d05f99-61d4-4925-b95a-97cc27e9b355', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 13:02:31.262091+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4f6c7c6-c417-4206-a3ed-2e97349c37a1', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 19:59:36.849993+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd25421cf-ae01-458c-ab3a-a4cbf15f41f2', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 19:59:36.851546+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c9ceea35-893c-46b2-b03a-f8077341dc66', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 20:35:07.463944+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a414073f-8e80-4f36-82c7-2d8bdbacb24c', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 20:59:00.278672+00', ''),
	('00000000-0000-0000-0000-000000000000', '2fe4f1bc-fbd8-4a8f-870d-c2cf4a054258', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 20:59:00.280716+00', ''),
	('00000000-0000-0000-0000-000000000000', '67ae4968-8520-4d00-8ea6-a52ea6f966fc', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 21:57:50.163794+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e31c1e1-4a08-45d2-b4ce-31fd6ba770e1', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 21:57:50.165485+00', ''),
	('00000000-0000-0000-0000-000000000000', '963d2336-6039-4be6-96ba-6e75fc68c2b5', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 22:23:18.68054+00', ''),
	('00000000-0000-0000-0000-000000000000', '368932a1-8a02-4f99-83d4-5ca0cde72f9a', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 22:36:58.431077+00', ''),
	('00000000-0000-0000-0000-000000000000', '9efbccec-b4a8-44f3-a240-e6b79c2a2d97', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 22:40:22.259447+00', ''),
	('00000000-0000-0000-0000-000000000000', '685b03f4-cc7f-48a7-a75c-de5393769bd5', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-29 22:42:04.357042+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd324e923-0d37-465f-ae10-f3b5c91f6d23', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-29 22:47:19.436951+00', ''),
	('00000000-0000-0000-0000-000000000000', '625bfc3e-55d3-469b-ba9b-fe44a03b0a64', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 23:45:58.532412+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7392605-7fed-4470-86fe-daaebef275bc', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-29 23:45:58.537649+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1954863-6b0f-4172-9baa-c67ecc8235d3', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 00:08:06.684765+00', ''),
	('00000000-0000-0000-0000-000000000000', '5fc5c433-f80b-44dc-a8ba-b1d477fbe28c', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 00:08:06.694953+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e988444-5b1f-4b87-add5-ead97d6afe17', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 02:32:34.758783+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd35478e9-2aa0-4982-99dc-1670b9885031', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 02:32:34.760377+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b5252706-8be8-411f-82a3-9fcb06219fa0', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 07:46:53.661449+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ae23c94-11da-4b5c-840a-fed55987687c', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 07:46:53.663565+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea85da77-d399-46b2-b8eb-301788af2d30', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 09:44:26.662176+00', ''),
	('00000000-0000-0000-0000-000000000000', '87803dea-437f-4d74-b153-7576c10533e9', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 09:44:26.66374+00', ''),
	('00000000-0000-0000-0000-000000000000', '4378c3b6-8f55-4048-ae5b-9f36893326fe', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 09:53:32.97488+00', ''),
	('00000000-0000-0000-0000-000000000000', '10a5f3d0-df14-402d-bcff-f0316fd84937', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-30 09:53:57.855321+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a467ee6e-9c8c-41da-90c6-d88971cdcba0', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 09:54:02.01621+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c666bcf-05db-46d6-bfeb-78f16af8da68', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 11:49:36.267745+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b3c3178-31ca-4c03-9cc9-addb7d796a0e', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 11:49:36.271736+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ea0e30a-5a64-4da8-9f42-5ecdf1cefb15', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 11:49:43.524815+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad61e01b-dabf-47d8-ad34-8d1286a8fdab', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 11:52:43.935578+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd94d13a-a9b9-4aad-a179-0ac59c6ef415', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 11:55:06.667135+00', ''),
	('00000000-0000-0000-0000-000000000000', '2ed0ad90-659b-4730-8393-69a36e6a422b', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-30 12:08:23.717252+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb8994a3-5180-468a-a496-d240ac83a244', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 12:08:27.768181+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1dabf7c-2dd7-43ec-92fb-7f0d58ddc2a5', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"account"}', '2025-06-30 12:08:52.302176+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ade8aad9-7ae4-4fd2-87c3-4e2d19e969d2', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 12:26:14.107486+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c4e95b70-6819-45f5-969b-44cbf72de71a', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-06-30 12:26:46.969492+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab33962f-bfec-4721-8f6c-31de5b423cba', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-30 12:26:50.583573+00', ''),
	('00000000-0000-0000-0000-000000000000', '3249c142-53c0-416c-b5e2-66d67f3c6796', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 13:28:05.303538+00', ''),
	('00000000-0000-0000-0000-000000000000', '2fee2114-5ff1-459e-940c-fbb21785b638', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-06-30 13:28:05.304392+00', ''),
	('00000000-0000-0000-0000-000000000000', '6fcb1b52-16ea-412d-8f3d-ade6b1197a59', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-07-01 03:23:22.727986+00', ''),
	('00000000-0000-0000-0000-000000000000', '7a340feb-4956-4a9c-be5d-f7214e51c768', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-07-01 03:23:22.735692+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ede62caa-2f17-404f-a42b-ce94744f6835', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-07-01 04:35:03.782413+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0e6a1fa-5cc3-489a-af04-ea0423793c78', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-07-01 04:35:03.783289+00', ''),
	('00000000-0000-0000-0000-000000000000', '5be188fd-0a5b-411f-801e-80f2c15d4aea', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-07-01 05:56:15.850224+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e0f80460-1452-4551-8af1-2fca2dce21fc', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000004","actor_username":"mohamed.gharbi@email.com","actor_via_sso":false,"log_type":"token"}', '2025-07-01 05:56:15.852782+00', ''),
	('00000000-0000-0000-0000-000000000000', '36a6b25f-f775-48ce-ab2a-fced9892a4df', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 05:59:17.450771+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee18b5ee-734a-4a5f-8d7f-62b68b2de33a', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:04:16.123031+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ad08d46-1cb3-4aef-b24b-98ce3f50f45d', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:06:12.467606+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c1ec4854-e4ce-47dc-8859-090589934dc4', '{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"user"}', '2025-07-01 06:06:18.674111+00', ''),
	('00000000-0000-0000-0000-000000000000', '020b8b6c-1031-4146-8135-3764759f9f16', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:06:26.535875+00', ''),
	('00000000-0000-0000-0000-000000000000', '8987890b-2153-44b8-8e61-475c8aa3f5cf', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-01 06:11:03.98885+00', ''),
	('00000000-0000-0000-0000-000000000000', 'abeda677-496e-410d-8e09-9f4b74c2a509', '{"action":"user_confirmation_requested","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-07-01 06:11:47.354812+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a769e0e-1af1-4da5-8391-c15355a2b569', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:11:55.406646+00', ''),
	('00000000-0000-0000-0000-000000000000', '6997f165-00ba-407d-8fde-912da03d7b7c', '{"action":"user_signedup","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-07-01 06:13:03.725725+00', ''),
	('00000000-0000-0000-0000-000000000000', '66765722-a6d5-4a39-b695-120cca6921b4', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-01 06:13:16.796279+00', ''),
	('00000000-0000-0000-0000-000000000000', '20a28912-5665-4d40-8659-93c8e84ed1c6', '{"action":"login","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:13:19.524365+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f63a185-fb01-4918-b64b-402839662a5e', '{"action":"login","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:15:24.777506+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b5032f67-014d-4215-bf3b-6576a2a8a8d7', '{"action":"login","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:17:38.628898+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb7053bd-6005-40fc-857c-d3a66d113eec', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:27:59.722384+00', ''),
	('00000000-0000-0000-0000-000000000000', '3905361d-d4d2-4f23-b034-9888aeb42a49', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-01 06:28:19.154277+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a825b421-f787-44b5-9385-52aa118957bc', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:28:22.529418+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fe5d0de1-8a88-4d43-b378-f44ded4e8262', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:34:07.17071+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb4c1e2b-191b-4a0d-9a18-e04890a1cdb6', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:36:30.280303+00', ''),
	('00000000-0000-0000-0000-000000000000', '049c633e-33e4-4a3d-b798-43a0b60ece6b', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:38:50.259328+00', ''),
	('00000000-0000-0000-0000-000000000000', '295b87f4-21d4-4081-847f-180ce2305811', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-01 06:39:00.140135+00', ''),
	('00000000-0000-0000-0000-000000000000', '2eb3e094-914f-4d99-933f-4c55b6949449', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:39:03.133169+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee8e406c-96da-4b86-a025-776331fdcb14', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000003","actor_username":"fatma.trabelsi@email.com","actor_via_sso":false,"log_type":"account"}', '2025-07-01 06:39:06.822229+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0857b33-9bca-4e75-930f-9d52de0620a3', '{"action":"login","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:45:55.203606+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc0f14f2-e0cc-49d8-aa41-4bc04c3d855c', '{"action":"logout","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-07-01 06:46:00.554559+00', ''),
	('00000000-0000-0000-0000-000000000000', '47461b98-35b8-44aa-81b1-ca62a3a110c1', '{"action":"user_confirmation_requested","actor_id":"986d9905-47f3-456f-acbb-f3f917b96f62","actor_username":"mohamed.bejaoui@firstdeliverygroup.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-07-01 06:46:21.362532+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f9bcf72-aefb-4375-940c-0c20d8228c21', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:54:21.073291+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ac060aa-d88f-4daf-858d-622faf847243', '{"action":"logout","actor_id":"00000000-0000-0000-0000-000000000001","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-01 06:54:35.261834+00', ''),
	('00000000-0000-0000-0000-000000000000', '81c35425-a4be-4992-badf-e112b86308f3', '{"action":"login","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:54:50.61388+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a892f611-cf1a-40f9-b7b7-4737976aa8f0', '{"action":"login","actor_id":"8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d","actor_username":"bjaoui24@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-01 06:55:03.003921+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'leila.mansouri@email.com', '$2a$06$hlO4B5JoorJb0G7Wwfq0EecEQHEY9q1R7zy/LXglRGii.JRZigFMi', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-06-29 10:31:48.931607+00', '{"provider": "email", "providers": ["email"]}', '{"role": "User", "last_name": "Mansouri", "first_name": "Leila"}', false, '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'ahmed.benali@email.com', '$2a$06$yg6hzSAf0pJi/R2t0cSoq.YuxZUiSVeVY9fb2llS4q6yzRNYTBV/O', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-06-29 11:19:52.384326+00', '{"provider": "email", "providers": ["email"]}', '{"role": "Premium", "last_name": "Ben Ali", "first_name": "Ahmed"}', false, '2025-06-29 10:31:48.931607+00', '2025-06-29 11:19:52.387104+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '986d9905-47f3-456f-acbb-f3f917b96f62', 'authenticated', 'authenticated', 'mohamed.bejaoui@firstdeliverygroup.com', '$2a$10$jiOsyUCnoTul5jD6x0UVReD9/Xku4gXT/5Gr7ky.asABNG/tXdFES', NULL, NULL, 'cda8ecbe91dbe97dde16347f405f0f2af659b28a27f34b087f6e6af5', '2025-07-01 06:46:21.363195+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "986d9905-47f3-456f-acbb-f3f917b96f62", "role": "User", "email": "mohamed.bejaoui@firstdeliverygroup.com", "last_name": "bjaoui", "first_name": "med", "email_verified": false, "phone_verified": false}', NULL, '2025-07-01 06:46:21.350702+00', '2025-07-01 06:46:21.627414+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'mohamed.gharbi@email.com', '$2a$06$Xq5YqShPAUzcUZiIbIHykejoZ5azOvu2baNOV0qC/tUbuYfdIPny.', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-06-30 12:26:50.584294+00', '{"provider": "email", "providers": ["email"]}', '{"role": "User", "last_name": "Gharbi", "first_name": "Mohamed"}', false, '2025-06-29 10:31:48.931607+00', '2025-07-01 05:56:15.856208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'test@example.com', '$2a$06$DBVCrvgFzQQlGHwk0Lf43uXi1Rh2zg4rcLPkRDJu0CmOc0tuenfLC', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-07-01 06:54:21.075065+00', '{"provider": "email", "providers": ["email"]}', '{"role": "Admin", "last_name": "User", "first_name": "Test"}', false, '2025-06-29 10:31:48.931607+00', '2025-07-01 06:54:21.079898+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', 'authenticated', 'authenticated', 'bjaoui24@gmail.com', '$2a$10$N6xc0LA/FQY6H/qR0fdLzeNbCK7Ic63UarHDpwB6czioYJkCF.p4K', '2025-07-01 06:13:03.727348+00', NULL, '', '2025-07-01 06:11:47.358332+00', '', NULL, '', '', NULL, '2025-07-01 06:55:03.005427+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d", "role": "User", "email": "bjaoui24@gmail.com", "last_name": "bjaoui", "first_name": "med", "email_verified": true, "phone_verified": false}', NULL, '2025-07-01 06:11:47.336374+00', '2025-07-01 06:55:03.007298+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'fatma.trabelsi@email.com', '$2a$06$5Jp9GbN559oBv2CBp.G4xuGNn8cWGVKKcKC8LsG3KZoMk0Pel2Y3i', '2025-06-29 10:31:48.931607+00', '2025-06-29 10:31:48.931607+00', '', '2025-06-29 10:31:48.931607+00', '', NULL, '', '', NULL, '2025-07-01 06:39:03.13385+00', '{"provider": "email", "providers": ["email"]}', '{"role": "User", "last_name": "Trabelsi", "first_name": "Fatma"}', false, '2025-06-29 10:31:48.931607+00', '2025-07-01 06:39:03.136446+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', '{"sub": "8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d", "role": "User", "email": "bjaoui24@gmail.com", "last_name": "bjaoui", "first_name": "med", "email_verified": true, "phone_verified": false}', 'email', '2025-07-01 06:11:47.350221+00', '2025-07-01 06:11:47.350284+00', '2025-07-01 06:11:47.350284+00', '80451bc7-8246-4739-bed4-73673ef91dea'),
	('986d9905-47f3-456f-acbb-f3f917b96f62', '986d9905-47f3-456f-acbb-f3f917b96f62', '{"sub": "986d9905-47f3-456f-acbb-f3f917b96f62", "role": "User", "email": "mohamed.bejaoui@firstdeliverygroup.com", "last_name": "bjaoui", "first_name": "med", "email_verified": false, "phone_verified": false}', 'email', '2025-07-01 06:46:21.357442+00', '2025-07-01 06:46:21.357503+00', '2025-07-01 06:46:21.357503+00', '25b4c5ea-4a1d-4d81-922c-f4d697bc5c64');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('adc46a6b-23fe-4e5a-a55c-dab91c315422', '00000000-0000-0000-0000-000000000004', '2025-06-30 12:26:50.584373+00', '2025-07-01 05:56:15.857911+00', NULL, 'aal1', NULL, '2025-07-01 05:56:15.857841', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '197.17.11.33', NULL),
	('e2de71e2-8ff6-4f03-b0c7-42ffa8714303', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', '2025-07-01 06:54:50.614717+00', '2025-07-01 06:54:50.614717+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '197.17.11.33', NULL),
	('05d31916-b47c-4662-ad74-2eef428e46c2', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', '2025-07-01 06:55:03.005515+00', '2025-07-01 06:55:03.005515+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '197.17.11.33', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('adc46a6b-23fe-4e5a-a55c-dab91c315422', '2025-06-30 12:26:50.586402+00', '2025-06-30 12:26:50.586402+00', 'password', '072b8fa2-b88a-4829-8a53-8bbd4e439749'),
	('e2de71e2-8ff6-4f03-b0c7-42ffa8714303', '2025-07-01 06:54:50.616748+00', '2025-07-01 06:54:50.616748+00', 'password', '1a339600-1344-41cd-b74a-dc0e45754cec'),
	('05d31916-b47c-4662-ad74-2eef428e46c2', '2025-07-01 06:55:03.007645+00', '2025-07-01 06:55:03.007645+00', 'password', '78042685-4084-44c0-9d81-4df31fde86d0');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('91c79438-96bb-40d7-9edb-3f001b0863ac', '986d9905-47f3-456f-acbb-f3f917b96f62', 'confirmation_token', 'cda8ecbe91dbe97dde16347f405f0f2af659b28a27f34b087f6e6af5', 'mohamed.bejaoui@firstdeliverygroup.com', '2025-07-01 06:46:21.630035', '2025-07-01 06:46:21.630035');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 57, 'eu6mgh7qxnr6', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', false, '2025-07-01 06:54:50.615502+00', '2025-07-01 06:54:50.615502+00', NULL, 'e2de71e2-8ff6-4f03-b0c7-42ffa8714303'),
	('00000000-0000-0000-0000-000000000000', 58, 'jxuhmfvcs7hi', '8e5852de-6e0e-45a9-8ff4-28d3f7c26b9d', false, '2025-07-01 06:55:03.006318+00', '2025-07-01 06:55:03.006318+00', NULL, '05d31916-b47c-4662-ad74-2eef428e46c2'),
	('00000000-0000-0000-0000-000000000000', 35, 'c5tvairqvpuh', '00000000-0000-0000-0000-000000000004', true, '2025-06-30 12:26:50.585132+00', '2025-06-30 13:28:05.304951+00', NULL, 'adc46a6b-23fe-4e5a-a55c-dab91c315422'),
	('00000000-0000-0000-0000-000000000000', 36, '64ycsqw4y7qq', '00000000-0000-0000-0000-000000000004', true, '2025-06-30 13:28:05.307214+00', '2025-07-01 03:23:22.736358+00', 'c5tvairqvpuh', 'adc46a6b-23fe-4e5a-a55c-dab91c315422'),
	('00000000-0000-0000-0000-000000000000', 37, '2pub4rv2yao5', '00000000-0000-0000-0000-000000000004', true, '2025-07-01 03:23:22.743072+00', '2025-07-01 04:35:03.783857+00', '64ycsqw4y7qq', 'adc46a6b-23fe-4e5a-a55c-dab91c315422'),
	('00000000-0000-0000-0000-000000000000', 38, 'nlpo5ygdavqt', '00000000-0000-0000-0000-000000000004', true, '2025-07-01 04:35:03.784684+00', '2025-07-01 05:56:15.853598+00', '2pub4rv2yao5', 'adc46a6b-23fe-4e5a-a55c-dab91c315422'),
	('00000000-0000-0000-0000-000000000000', 39, 'skmmt3nsy2ny', '00000000-0000-0000-0000-000000000004', false, '2025-07-01 05:56:15.854869+00', '2025-07-01 05:56:15.854869+00', 'nlpo5ygdavqt', 'adc46a6b-23fe-4e5a-a55c-dab91c315422');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 58, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
