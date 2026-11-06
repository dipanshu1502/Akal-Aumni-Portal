<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddDonationProofAndReview extends Migration
{
    public function up()
    {
        $this->forge->addColumn('donations', [
            'proof_path' => [
                'type'       => 'VARCHAR',
                'constraint' => 500,
                'null'       => true,
                'after'      => 'transaction_id',
            ],
            'reviewed_by' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => true,
                'after'      => 'status',
            ],
            'reviewed_at' => [
                'type'  => 'DATETIME',
                'null'  => true,
                'after' => 'reviewed_by',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('donations', ['proof_path', 'reviewed_by', 'reviewed_at']);
    }
}
