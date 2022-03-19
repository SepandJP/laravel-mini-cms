    @php
      $url = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    @endphp
    <div class="sidenav-header">
      <i class="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
      <a class="navbar-brand m-0" href="/" target="_blank">
        <img src="../admin/img/logo-ct.png" class="navbar-brand-img h-100" alt="main_logo">
        <span class="ms-1 font-weight-bold text-white">Home Page</span>
      </a>
    </div>
    <hr class="horizontal light mt-0 mb-2">
    <div class="collapse navbar-collapse  w-auto  max-height-vh-100" id="sidenav-collapse-main">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('dashboard') ? __('active bg-gradient-primary') : '' }}" href="{{route('dashboard')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">dashboard</i>
            </div>
            <span class="nav-link-text ms-1">Dashboard</span>
          </a>
        </li>
        <li class="nav-item mt-3">
          <h6 class="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Users</h6>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('users.index') ? __('active bg-gradient-primary') : '' }}" href="{{route('users.index')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">people</i>
            </div>
            <span class="nav-link-text ms-1">Show All Users</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('users.create') ? __('active bg-gradient-primary') : '' }}" href="{{route('users.create')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">person_add</i>
            </div>
            <span class="nav-link-text ms-1">Create New User</span>
          </a>
        </li>
        <li class="nav-item mt-3">
          <h6 class="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Posts</h6>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('posts.index') ? __('active bg-gradient-primary') : '' }}" href="{{route('posts.index')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">description</i>
            </div>
            <span class="nav-link-text ms-1">Show All Posts</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('posts.create') ? __('active bg-gradient-primary') : '' }}" href="{{route('posts.create')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">post_add</i>
            </div>
            <span class="nav-link-text ms-1">New Post</span>
          </a>
        </li>
        <li class="nav-item mt-3">
          <h6 class="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Categories</h6>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('categories.index') ? __('active bg-gradient-primary') : '' }}" href="{{route('categories.index')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">store</i>
            </div>
            <span class="nav-link-text ms-1">Posts Categories</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('categories.create') ? __('active bg-gradient-primary') : '' }}" href="{{route('categories.create')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">add_business</i>
            </div>
            <span class="nav-link-text ms-1">Add Category</span>
          </a>
        </li>
        <li class="nav-item mt-3">
          <h6 class="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Comments</h6>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('comments.index') ? __('active bg-gradient-primary') : '' }}" href="{{route('comments.index')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">comment</i>
            </div>
            <span class="nav-link-text ms-1">Show All Comments</span>
          </a>
        </li>
        <li class="nav-item mt-3">
          <h6 class="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Photos</h6>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('photos.index') ? __('active bg-gradient-primary') : '' }}" href="{{route('photos.index')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">perm_media</i>
            </div>
            <span class="nav-link-text ms-1">All Photos</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-white {{$url == route('photos.create') ? __('active bg-gradient-primary') : '' }}" href="{{route('photos.create')}}">
            <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
              <i class="material-icons opacity-10">upload_file</i>
            </div>
            <span class="nav-link-text ms-1">Upload Photo</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="sidenav-footer position-absolute w-100 bottom-0 ">
      <div class="mx-3">
        <a class="btn bg-gradient-primary mt-4 w-100" href="{{route('dashboard')}}" type="button">Admin Panel</a>
      </div>
    </div>
