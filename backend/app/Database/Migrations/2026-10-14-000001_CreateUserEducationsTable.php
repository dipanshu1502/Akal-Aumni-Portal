<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Stores every degree/programme a user has completed or is pursuing
 * at Akal University (UG, PG, PhD, Diploma, etc.) for alumni & students.
 */
class CreateUserEducationsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'education_level' => [
                'type'       => 'ENUM',
                'constraint' => ['UG', 'PG', 'PhD', 'Diploma', 'Other'],
                'default'    => 'UG',
            ],
            'degree_name' => [
                'type'       => 'VARCHAR',
                'constraint' => '150',
            ],
            'department' => [
                'type'       => 'VARCHAR',
                'constraint' => '100',
            ],
            'specialization' => [
                'type'       => 'VARCHAR',
                'constraint' => '150',
                'null'       => true,
            ],
            'enrollment_no' => [
                'type'       => 'VARCHAR',
                'constraint' => '50',
                'null'       => true,
            ],
            'start_year' => [
                'type'       => 'INT',
                'constraint' => 4,
            ],
            'end_year' => [
                'type'       => 'INT',
                'constraint' => 4,
                'null'       => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['completed', 'ongoing'],
                'default'    => 'completed',
            ],
            'grade' => [
                'type'       => 'VARCHAR',
                'constraint' => '30',
                'null'       => true,
            ],
            'research_title' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
                'null'       => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('user_id');
        $this->forge->addKey('education_level');
        $this->forge->addKey('department');
        $this->forge->createTable('user_educations', true);
    }

    public function down()
    {
        $this->forge->dropTable('user_educations', true);
    }
}
