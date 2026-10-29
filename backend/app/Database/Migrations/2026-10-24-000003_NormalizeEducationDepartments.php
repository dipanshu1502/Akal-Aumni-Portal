<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class NormalizeEducationDepartments extends Migration
{
    public function up()
    {
        if (!$this->db->tableExists('user_educations')) {
            return;
        }

        $departmentMappings = [
            'Botany & Biotechnology' => 'Life Sciences',
            'Commerce & Management' => 'Commerce',
            'Computer Science & Engineering' => 'CSE',
            'Mathematics & Computing' => 'Mathematics',
        ];

        foreach ($departmentMappings as $legacyName => $canonicalName) {
            $this->db->table('user_educations')->where('department', $legacyName)->update(['department' => $canonicalName]);
        }
    }

    public function down()
    {
        // Keep canonical department names on rollback for consistent records.
    }
}
