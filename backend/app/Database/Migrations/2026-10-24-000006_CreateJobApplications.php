<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateJobApplications extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'job_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'user_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey(['job_id', 'user_id'], false, true);
        $this->forge->addKey('user_id');
        $this->forge->createTable('job_applications', true);
    }

    public function down()
    {
        $this->forge->dropTable('job_applications', true);
    }
}
