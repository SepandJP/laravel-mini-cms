 <!-- Navigation-->
 <nav class="navbar navbar-expand-lg navbar-light" id="mainNav">
  <div class="container px-4 px-lg-5">
      <a class="navbar-brand" href="{{ config('app.url') }}">{{ config('app.name') }}</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          Menu
          <i class="fas fa-bars"></i>
      </button>
      <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto py-4 py-lg-0">
              <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="{{ config('app.url') }}">Home</a></li>
              <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="about.html">About</a></li>
              <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="contact.html">Contact</a></li>
              <!-- Categories -->
              <li class="nav-item dropdown">
                <a class="nav-link px-lg-3 py-3 py-lg-4 dropdown-toggle" href="#" id="mainNavbarCategoriesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Categories
                </a>
                <ul class="dropdown-menu" aria-labelledby="mainNavbarCategoriesDropdown">
                    @foreach ($categories as $category)
                    <li>
                        <a class="dropdown-item" href="{{ route('show.category', $category->slug) }}">{{ $category->title }}</a>
                    </li>                        
                    @endforeach
                </ul>
              </li>
              <!-- End of Categories -->
          </ul>
      </div>
  </div>
</nav>