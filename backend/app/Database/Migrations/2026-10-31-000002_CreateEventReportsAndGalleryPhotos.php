<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateEventReportsAndGalleryPhotos extends Migration
{
    public function up()
    {
        $this->forge->addColumn('gallery_albums', [
            'event_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'null' => true],
            'photos_json' => ['type' => 'LONGTEXT', 'null' => true],
        ]);

        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'event_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'email_address' => ['type' => 'VARCHAR', 'constraint' => 255],
            'coordinators' => ['type' => 'VARCHAR', 'constraint' => 500],
            'department' => ['type' => 'VARCHAR', 'constraint' => 100],
            'event_type' => ['type' => 'VARCHAR', 'constraint' => 100],
            'event_date' => ['type' => 'DATE'],
            'speaker_name' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'speaker_uid' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'batch' => ['type' => 'VARCHAR', 'constraint' => 100],
            'participants_count' => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
            'detailed_report' => ['type' => 'LONGTEXT'],
            'photos_json' => ['type' => 'LONGTEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('event_id', false, true);
        $this->forge->createTable('event_reports', true);
    }

    public function down()
    {
        $this->forge->dropTable('event_reports', true);
        $this->forge->dropColumn('gallery_albums', ['event_id', 'photos_json']);
    }
}
