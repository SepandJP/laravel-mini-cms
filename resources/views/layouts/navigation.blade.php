
        <!-- Navbar -->
        <nav class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl">
            <div class="py-1 px-3">
              <div class="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
                <div class="ms-md-auto pe-md-3">
                    <div class="px-4 d-flex flex-column align-items-end">
                        <div class="text-gray-800">{{ Auth::user()->name }}</div>
                        <div class="text-gray-500">{{ Auth::user()->email }}</div>
                    </div>
                </div>
                <div class="d-flex justify-content-end">
                <ul class="navbar-nav">
                  <li class="nav-item">
                    <a href="javascript:;" class="nav-link text-body font-weight-bold px-0">
                        <!-- Authentication -->
                        <form class="d-flex align-items-center" method="POST" action="{{ route('logout') }}">
                            @csrf
                            <x-responsive-nav-link :href="route('logout')"
                                    onclick="event.preventDefault();
                                                this.closest('form').submit();">
                                <span class="mx-2">Log Out</span>
                                <i class="fa fa-sign-out"></i>
                            </x-responsive-nav-link>
                        </form>
                    </a>
                  </li>
                  <li class="nav-item ps-3 d-flex align-items-center">
                    <a href="javascript:;" class="nav-link text-body p-0 px-0 d-flex align-items-center" id="iconNavbarSidenav">
                      <div class="sidenav-toggler-inner mx-2">
                        <i class="sidenav-toggler-line"></i>
                        <i class="sidenav-toggler-line"></i>
                        <i class="sidenav-toggler-line"></i>
                      </div>
                      <span class="">Show Sidebar Menu</span>
                    </a>
                  </li>
                </ul>
            </div>
              </div>
            </div>
          </nav>
          <!-- End Navbar -->
