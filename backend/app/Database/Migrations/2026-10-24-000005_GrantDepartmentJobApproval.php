<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class GrantDepartmentJobApproval extends Migration
{
    public function up()
    {
        $admins = $this->db->table('admin_profiles')
            ->select('admin_profiles.user_id, admin_profiles.permissions')
            ->join('users', 'users.id = admin_profiles.user_id')
            ->where('users.role', 'admin')
            ->get()->getResultArray();

        foreach ($admins as $admin) {
            $permissions = json_decode($admin['permissions'] ?? '', true);
            if (!is_array($permissions)) {
                $permissions = [];
            }
            $permissions['manage_jobs'] = true;

            $this->db->table('admin_profiles')
                ->where('user_id', (int) $admin['user_id'])
                ->update(['permissions' => json_encode($permissions)]);
        }
    }

    public function down()
    {
        $admins = $this->db->table('admin_profiles')
            ->select('admin_profiles.user_id, admin_profiles.permissions')
            ->join('users', 'users.id = admin_profiles.user_id')
            ->where('users.role', 'admin')
            ->get()->getResultArray();

        foreach ($admins as $admin) {
            $permissions = json_decode($admin['permissions'] ?? '', true);
            if (!is_array($permissions) || !array_key_exists('manage_jobs', $permissions)) {
                continue;
            }
            unset($permissions['manage_jobs']);
            $this->db->table('admin_profiles')
                ->where('user_id', (int) $admin['user_id'])
                ->update(['permissions' => json_encode($permissions)]);
        }
    }
}
