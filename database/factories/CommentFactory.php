<?php

namespace Database\Factories;

use App\Models\Comment;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Comment::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'description' => $this->faker->text(),
            'parent_id' => $this->faker->numberBetween(1,10),
            'post_id' => $this->faker->numberBetween(1, 30),
            'user_id' => $this->faker->numberBetween(1, 20)
        ];
    }
}
