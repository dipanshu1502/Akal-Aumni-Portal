<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class NormalizeDepartmentNames extends Migration
{
    public function up()
    {
        $departmentMappings = [
            'Botany & Biotechnology' => 'Life Sciences',
            'Commerce & Management' => 'Commerce',
            'Computer Science & Engineering' => 'CSE',
            'Mathematics & Computing' => 'Mathematics',
        ];

        foreach ($departmentMappings as $legacyName => $canonicalName) {
            $this->db->table('alumni_profiles')->where('department', $legacyName)->update(['department' => $canonicalName]);
            $this->db->table('student_profiles')->where('department', $legacyName)->update(['department' => $canonicalName]);
            if ($this->db->tableExists('user_educations')) {
                $this->db->table('user_educations')->where('department', $legacyName)->update(['department' => $canonicalName]);
            }
        }
    }

    public function down()
    {
        // Department normalization is intentionally retained on rollback:
        // multiple legacy labels collapse to one canonical department name.
    }
}
