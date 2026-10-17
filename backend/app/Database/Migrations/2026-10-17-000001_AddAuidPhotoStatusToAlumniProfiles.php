<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddAuidPhotoStatusToAlumniProfiles extends Migration
{
    public function up()
    {
        // 1. New columns for AUID, current status (higher study / job) and details
        $fields = [
            'auid' => [
                'type'       => 'VARCHAR',
                'constraint' => '9',
                'null'       => true,
                'unique'     => true,
                'after'      => 'registration_no',
            ],
            'alumni_id' => [
                'type'       => 'VARCHAR',
                'constraint' => '30',
                'null'       => true,
                'unique'     => true,
                'after'      => 'auid',
            ],
            'current_status' => [
                'type'       => 'VARCHAR',
                'constraint' => '30',
                'null'       => true,
                'after'      => 'current_designation',
            ],
            'study_institution' => [
                'type'       => 'VARCHAR',
                'constraint' => '200',
                'null'       => true,
                'after'      => 'current_status',
            ],
            'study_course' => [
                'type'       => 'VARCHAR',
                'constraint' => '200',
                'null'       => true,
                'after'      => 'study_institution',
            ],
            'study_location' => [
                'type'       => 'VARCHAR',
                'constraint' => '150',
                'null'       => true,
                'after'      => 'study_course',
            ],
            'job_type' => [
                'type'       => 'VARCHAR',
                'constraint' => '20',
                'null'       => true,
                'after'      => 'study_location',
            ],
            'job_organization' => [
                'type'       => 'VARCHAR',
                'constraint' => '200',
                'null'       => true,
                'after'      => 'job_type',
            ],
            'job_designation' => [
                'type'       => 'VARCHAR',
                'constraint' => '150',
                'null'       => true,
                'after'      => 'job_organization',
            ],
            'job_location' => [
                'type'       => 'VARCHAR',
                'constraint' => '150',
                'null'       => true,
                'after'      => 'job_designation',
            ],
        ];

        foreach ($fields as $name => $def) {
            // skip if column already exists (safe re-run)
            if (!$this->db->fieldExists($name, 'alumni_profiles')) {
                $this->forge->addColumn('alumni_profiles', [$name => $def]);
            }
        }

        // 2. profile_photo VARCHAR(255) -> MEDIUMTEXT (base64 DP store karne ke liye)
        if ($this->db->fieldExists('profile_photo', 'alumni_profiles')) {
            $this->db->query('ALTER TABLE `alumni_profiles` MODIFY `profile_photo` MEDIUMTEXT NULL');
        }
    }

    public function down()
    {
        foreach (['job_location', 'job_designation', 'job_organization', 'job_type', 'study_location', 'study_course', 'study_institution', 'current_status', 'alumni_id', 'auid'] as $col) {
            if ($this->db->fieldExists($col, 'alumni_profiles')) {
                $this->forge->dropColumn('alumni_profiles', $col);
            }
        }
        $this->db->query('ALTER TABLE `alumni_profiles` MODIFY `profile_photo` VARCHAR(255) NULL');
    }
}
