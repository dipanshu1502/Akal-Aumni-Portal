<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DemoDonationsSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();
        $now = date('Y-m-d H:i:s');

        // ── 1. Demo Donation Campaigns ────────────────────────────────
        $campaigns = [
            [
                'title'          => 'Akal University Scholarship Fund 2026',
                'description'    => 'Help bright students from underprivileged backgrounds pursue their dreams at Akal University. Your contribution directly funds tuition, hostel and study material for meritorious students who otherwise cannot afford higher education.',
                'target_amount'  => 500000,
                'cover_image'    => null,
                'category'       => 'Education',
                'start_date'     => '2026-10-01',
                'end_date'       => '2026-12-31',
                'is_published'   => 1,
                'is_featured'    => 1,
                'created_by'     => 1,
                'created_at'     => '2026-10-05 10:00:00',
                'updated_at'     => $now,
            ],
            [
                'title'          => 'New Library & Research Wing Construction',
                'description'    => 'Akal University is expanding its central library and adding a dedicated research wing with modern labs and 24x7 study spaces. Join this landmark initiative and leave a lasting legacy on campus.',
                'target_amount'  => 2500000,
                'cover_image'    => null,
                'category'       => 'Infrastructure',
                'start_date'     => '2026-09-15',
                'end_date'       => '2027-03-31',
                'is_published'   => 1,
                'is_featured'    => 0,
                'created_by'     => 2,
                'created_at'     => '2026-09-20 09:00:00',
                'updated_at'     => $now,
            ],
            [
                'title'          => 'Student Emergency Relief Fund',
                'description'    => 'Immediate financial support for students and families affected by medical emergencies, natural disasters and unforeseen hardships. Every rupee helps a family in crisis stay on track.',
                'target_amount'  => 200000,
                'cover_image'    => null,
                'category'       => 'Relief',
                'start_date'     => '2026-10-01',
                'end_date'       => null,
                'is_published'   => 1,
                'is_featured'    => 0,
                'created_by'     => 1,
                'created_at'     => '2026-10-02 12:00:00',
                'updated_at'     => $now,
            ],
        ];

        $db->table('donation_campaigns')->insertBatch($campaigns);
        $firstCampaignId = (int) $db->insertID();

        // ── 2. Demo Donations ─────────────────────────────────────────
        // Mixed: logged-in alumni (user_id linked) + guest donor + anonymous donor
        $donations = [
            [
                'campaign_id'    => $firstCampaignId,
                'user_id'        => 3, // Harpreet Singh
                'donor_name'     => 'Harpreet Singh',
                'donor_email'    => 'harpreet.tech@gmail.com',
                'donor_phone'    => '+91 9887952132',
                'amount'         => 5100,
                'message'        => 'Proud to give back to my alma mater. Every student deserves the chance I got!',
                'payment_method' => 'online',
                'transaction_id' => 'TXN-2026-10001',
                'status'         => 'completed',
                'is_anonymous'   => 0,
                'created_at'     => '2026-10-10 14:22:00',
            ],
            [
                'campaign_id'    => $firstCampaignId + 1,
                'user_id'        => 4, // Amanpreet Kaur
                'donor_name'     => 'Amanpreet Kaur',
                'donor_email'    => 'aman.kaur.data@outlook.com',
                'donor_phone'    => '+91 9861563831',
                'amount'         => 25000,
                'message'        => 'Happy to support the new research wing. Looking forward to seeing our juniors thrive.',
                'payment_method' => 'online',
                'transaction_id' => 'TXN-2026-10002',
                'status'         => 'completed',
                'is_anonymous'   => 0,
                'created_at'     => '2026-10-12 11:05:00',
            ],
            [
                'campaign_id'    => $firstCampaignId,
                'user_id'        => 5, // Jasleen Kaur
                'donor_name'     => 'Jasleen Kaur',
                'donor_email'    => 'jasleen.biotech@gmail.com',
                'donor_phone'    => '+91 9894513330',
                'amount'         => 2100,
                'message'        => 'Small contribution for a big cause — scholarships change lives.',
                'payment_method' => 'online',
                'transaction_id' => 'TXN-2026-10003',
                'status'         => 'completed',
                'is_anonymous'   => 0,
                'created_at'     => '2026-10-14 17:40:00',
            ],
            [
                'campaign_id'    => $firstCampaignId + 2,
                'user_id'        => null, // guest donor
                'donor_name'     => 'Rakesh Sharma',
                'donor_email'    => 'rakesh.sharma@yahoo.com',
                'donor_phone'    => '+91 9911223344',
                'amount'         => 10000,
                'message'        => 'Wishing strength to every family going through tough times.',
                'payment_method' => 'online',
                'transaction_id' => 'TXN-2026-10004',
                'status'         => 'completed',
                'is_anonymous'   => 0,
                'created_at'     => '2026-10-16 09:15:00',
            ],
            [
                'campaign_id'    => $firstCampaignId,
                'user_id'        => null, // anonymous donor
                'donor_name'     => 'Anonymous Donor',
                'donor_email'    => 'donor@example.com',
                'donor_phone'    => null,
                'amount'         => 5000,
                'message'        => 'In memory of my teachers who shaped my future.',
                'payment_method' => 'online',
                'transaction_id' => 'TXN-2026-10005',
                'status'         => 'completed',
                'is_anonymous'   => 1,
                'created_at'     => '2026-10-18 20:30:00',
            ],
        ];

        $db->table('donations')->insertBatch($donations);

        echo "Seeded 3 donation campaigns and 5 donations.\n";
    }
}


