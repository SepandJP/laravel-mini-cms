<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Photo;
use App\Models\Post;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            RoleSeeder::class,
        ]);

        User::factory()
            ->count(20)
            ->create();

        // Get all the roles attaching up to 3 random roles to each user
        $roles = Role::all();

        // Populate the pivot table
        User::all()->each(function ($user) use ($roles) { 
            $user->roles()->attach(
                $roles->random(rand(1, 2))->pluck('id')->toArray()
            ); 
        });

        Category::factory()
            ->count(5)
            ->create();

        Photo::factory()
            ->count(40)
            ->create();

        Post::factory()
            ->count(30)
            ->state(new Sequence(
                ['status' => '0'],
                ['status' => '1'],
                ))
            ->create();
    }
}
