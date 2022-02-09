<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Post::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'title' => $this->faker->sentence(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->text(),
            'meta_description' => $this->faker->realText(),
            'meta_keywords' => $this->faker->words(5, true),
            'user_id' => $this->faker->numberBetween(1,20),
            'photo_id' => $this->faker->numberBetween(1,40),
            'category_id' => $this->faker->numberBetween(1,5),
        ];
    }
}
