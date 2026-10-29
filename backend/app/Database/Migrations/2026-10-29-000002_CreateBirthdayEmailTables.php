<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBirthdayEmailTables extends Migration
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
            'subject' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'message_body' => [
                'type' => 'TEXT',
            ],
            'is_enabled' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
            ],
            'last_run_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'last_test_email_at' => [
                'type' => 'DATETIME',
                'null' => true,
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
        $this->forge->createTable('birthday_email_settings', true);

        $this->db->table('birthday_email_settings')->insert([
            'id'           => 1,
            'subject'      => 'Happy Birthday, {{name}}!',
            'message_body' => "Dear {{name}},\n\nWishing you a wonderful birthday and a year filled with happiness, good health, and success. You will always be a valued part of the {{university_name}} family.\n\nWarm wishes,\nAkal University Alumni Association",
            'is_enabled'   => 0,
            'created_at'   => date('Y-m-d H:i:s'),
            'updated_at'   => date('Y-m-d H:i:s'),
        ]);

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
                'null'       => true,
            ],
            'birthday_year' => [
                'type'       => 'INT',
                'constraint' => 4,
                'unsigned'   => true,
            ],
            'recipient_email' => [
                'type'       => 'VARCHAR',
                'constraint' => 191,
            ],
            'email_subject' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['sent', 'failed'],
            ],
            'error_message' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'sent_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey(['user_id', 'birthday_year'], false, true, 'uq_birthday_user_year');
        $this->forge->addKey(['status', 'created_at'], false, false, 'idx_birthday_status_created');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'SET NULL');
        $this->forge->createTable('birthday_email_logs', true);
    }

    public function down()
    {
        $this->forge->dropTable('birthday_email_logs', true);
        $this->forge->dropTable('birthday_email_settings', true);
    }
}
