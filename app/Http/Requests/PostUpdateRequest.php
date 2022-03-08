<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class PostUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Generate a URL friendly "slug" from a given string,
     * before validating the request.
     *
     * @return void
     */
    public function prepareForValidation()
    {
        if ($this->input('slug'))
        {
            $this->merge(['slug' => Str::slug($this->input('slug'))]);
        }
        else
        {
            $this->merge(['slug' => Str::slug($this->input('title'))]);
        }
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => 'required|string|min:10', Rule::unique('posts')->ignore($this->post),
            'slug' => Rule::unique('posts')->ignore($this->post),
            'description' => 'required',
            'category' => 'required'
        ];
    }
}
