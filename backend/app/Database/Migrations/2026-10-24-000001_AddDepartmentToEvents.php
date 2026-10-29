<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddDepartmentToEvents extends Migration
{
    public function up()
    {
        if (!$this->db->fieldExists('department', 'events')) {
            $this->forge->addColumn('events', [
                'department' => [
                    'type'       => 'VARCHAR',
                    'constraint' => 100,
                    'null'       => true,
                    'after'      => 'event_type',
                ],
            ]);
        }
    }

    public function down()
    {
        if ($this->db->fieldExists('department', 'events')) {
            $this->forge->dropColumn('events', 'department');
        }
    }
}
