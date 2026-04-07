-- Curated shortlist from AP/Telangana source list (College List.xlsx)
-- Note: names normalized to exact/closest entries present in the source.
INSERT INTO public.colleges (name, code) VALUES
('Lords Institute of Engineering and Technology', 'tg-lords-institute-of-engineering-and-technology'),
('Methodist College of Engineering & Technology', 'tg-methodist-college-of-engineering-and-technology'),
('Chaitanya Bharathi Institute of Technology, Hyderabad', 'tg-chaitanya-bharathi-institute-of-technology-hyderabad'),
('Shadan College of Engineering and Technology', 'tg-shadan-college-of-engineering-and-technology'),
('Sultan Ul Uloom College of Pharmacy', 'tg-sultan-ul-uloom-college-of-pharmacy'),
('Muffakham Jah College of Engineering and Technology', 'tg-muffakham-jah-college-of-engineering-and-technology')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
