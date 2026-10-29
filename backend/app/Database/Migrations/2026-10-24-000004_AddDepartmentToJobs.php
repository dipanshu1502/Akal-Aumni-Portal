<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddDepartmentToJobs extends Migration
{
    public function up()
    {
        if (!$this->db->fieldExists('department', 'jobs')) {
            $this->forge->addColumn('jobs', [
                'department' => [
                    'type'       => 'VARCHAR',
                    'constraint' => 100,
                    'null'       => true,
                    'after'      => 'posted_by_user_id',
                ],
            ]);
        }

        $legacyJobs = $this->db->table('jobs')
            ->select('id, posted_by_user_id')
            ->where('department IS NULL', null, false)
            ->where('posted_by_user_id IS NOT NULL', null, false)
            ->get()->getResultArray();
        foreach ($legacyJobs as $job) {
            $profile = $this->db->table('alumni_profiles')
                ->select('department')
                ->where('user_id', (int) $job['posted_by_user_id'])
                ->get()->getRowArray();
            if (!empty($profile['department'])) {
                $this->db->table('jobs')->where('id', (int) $job['id'])->update(['department' => $profile['department']]);
            }
        }
    }

    public function down()
    {
        if ($this->db->fieldExists('department', 'jobs')) {
            $this->forge->dropColumn('jobs', 'department');
        }
    }
}
