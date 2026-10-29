<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddDateOfBirthToAlumniProfiles extends Migration
{
    public function up()
    {
        if (!$this->db->fieldExists('date_of_birth', 'alumni_profiles')) {
            $this->forge->addColumn('alumni_profiles', [
                'date_of_birth' => [
                    'type'       => 'DATE',
                    'null'       => true,
                ],
            ]);
        }
    }

    public function down()
    {
        if ($this->db->fieldExists('date_of_birth', 'alumni_profiles')) {
            $this->forge->dropColumn('alumni_profiles', 'date_of_birth');
        }
    }
}
