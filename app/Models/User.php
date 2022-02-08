<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    /**
     * Define Many to Many relationship between roles and users tables.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function photo()
    {
        return $this->belongsTo(Photo::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Which users have the right to change the users?
     * 
     * 1- Only the administrators have the right to change users.
     * 2- Administrators do not have the right to change users unless they have verified their emails.
     *
     * @return boolean true|false
     *                  if Admin have the right to modify users, return TRUE
     *                  else, return FALSE
     * 
     */
    public function isAdmin()
    {
        foreach ($this->roles as $role)
        {
            if ($role->id == 2 && $this->email_verified_at != NULL)
            {
                return true;
            }
        }
        return false;
    }
}
