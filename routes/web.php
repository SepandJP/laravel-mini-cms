<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Blog;
use App\Http\Controllers\Blog\CommentsController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


Route::middleware('admin')->prefix('admin')->group(function () {
    Route::resource('users', Admin\AdminUserController::class);
    Route::resource('posts', Admin\AdminPostController::class);
    Route::resource('categories', Admin\AdminCategoryController::class);
    Route::resource('photos', Admin\AdminPhotoCotroller::class);

    Route::get('comments', [Admin\AdminCommentsController::class, 'index'])->name('comments.index');
    Route::post('comments/{id}/action', [Admin\AdminCommentsController::class, 'action'])->name('comments.action');
    Route::get('comments/{id}', [Admin\AdminCommentsController::class, 'edit'])->name('comments.edit');
    Route::patch('comments/{id}', [Admin\AdminCommentsController::class, 'update'])->name('comments.update');
    Route::delete('comments/{id}', [Admin\AdminCommentsController::class, 'destroy'])->name('comments.destroy');

    Route::get('dashboard', [Admin\AdminDashboardController::class, 'dashboard'])->name('dashboard');
});

Route::get('/', [Blog\MainController::class, 'index'])->name('index');
Route::get('post/{slug}', [Blog\ShowController::class, 'posts'])->name('show.post');
Route::get('user/{id}', [Blog\ShowController::class, 'users'])->name('show.user');
Route::get('category/{slug}', [Blog\ShowController::class, 'categories'])->name('show.category');
Route::get('search/', [Blog\MainController::class, 'search'])->name('search');

Route::post('comment/{postId}', [CommentsController::class, 'store'])->name('comment.add');
Route::post('comment/', [CommentsController::class, 'reply'])->name('comment.reply');

require __DIR__.'/auth.php';
