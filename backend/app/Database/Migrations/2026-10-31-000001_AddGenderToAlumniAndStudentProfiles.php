<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddGenderToAlumniAndStudentProfiles extends Migration
{
    public function up()
    {
        if ($this->db->tableExists('alumni_profiles') && !$this->db->fieldExists('gender', 'alumni_profiles')) {
            $this->forge->addColumn('alumni_profiles', [
                'gender' => [
                    'type'       => 'VARCHAR',
                    'constraint' => '20',
                    'null'       => true,
                    'after'      => 'last_name',
                ],
            ]);
        }

        if ($this->db->tableExists('student_profiles') && !$this->db->fieldExists('gender', 'student_profiles')) {
            $this->forge->addColumn('student_profiles', [
                'gender' => [
                    'type'       => 'VARCHAR',
                    'constraint' => '20',
                    'null'       => true,
                    'after'      => 'last_name',
                ],
            ]);
        }
    }

    public function down()
    {
        if ($this->db->tableExists('alumni_profiles') && $this->db->fieldExists('gender', 'alumni_profiles')) {
            $this->forge->dropColumn('alumni_profiles', 'gender');
        }

        if ($this->db->tableExists('student_profiles') && $this->db->fieldExists('gender', 'student_profiles')) {
            $this->forge->dropColumn('student_profiles', 'gender');
        }
    }
}

