<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddLearningOutcomesToEventReports extends Migration
{
    public function up()
    {
        $this->forge->addColumn('event_reports', [
            'learning_outcomes' => ['type' => 'LONGTEXT', 'null' => true],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('event_reports', 'learning_outcomes');
    }
}
