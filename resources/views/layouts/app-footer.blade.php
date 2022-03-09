<footer class="footer py-4  ">
    <div class="container-fluid">
      <div class="row align-items-center justify-content-lg-between">
        <div class="col-lg-6 mb-lg-0 mb-4">
          <div class="copyright text-center text-sm text-muted text-lg-start">
            © <script>
              document.write(new Date().getFullYear())
            </script>,
            made with <i class="fa fa-heart"></i> by
            <a href="https://www.redl.ink/sepand" class="font-weight-bold" target="_blank">Sepand JamshidPour</a>
          </div>
        </div>
        <div class="col-lg-6">
          <ul class="nav nav-footer justify-content-center justify-content-lg-end">
            <li class="nav-item">
              <a href="https://www.linkedin.com/in/sepandJP" class="nav-link text-muted" target="_blank">Linkedin</a>
            </li>
            <li class="nav-item">
              <a href="https://github.com/SepandJP" class="nav-link text-muted" target="_blank">GithHub</a>
            </li>
            <li class="nav-item">
              <a href="https://codepen.io/sepand" class="nav-link text-muted" target="_blank">Codepen</a>
            </li>
            <li class="nav-item">
              <a href="https://www.t.me/SepandJP" class="nav-link pe-0 text-muted" target="_blank">Telegram</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>

        @yield('footer')
        
        <!--   Core JS Files   -->
        <script src="{{ asset('admin/js/core/popper.min.js') }}"></script>
        <script src="{{ asset('admin/js/core/bootstrap.bundle.min.js') }}"></script>
        <script src="{{ asset('admin/js/core/bootstrap.min.js') }}"></script>

        <!--   Plugins JS Files   -->   
        <script src="{{ asset('admin/js/plugins/chartjs.min.js') }}"></script>
        <script src="{{ asset('admin/js/plugins/perfect-scrollbar.min.js') }}"></script>
        <script src="{{ asset('admin/js/plugins/smooth-scrollbar.min.js') }}"></script>
        <script src="{{ asset('admin/js/plugins/world.js') }}"></script>
        <script src="{{ asset('admin/js/plugins/bootstrap-notify.js') }}"></script>
        <script src="{{ asset('admin/js/plugins/Chart.extension.js') }}"></script>

            @yield('scripts')

        <!-- Github buttons -->
        <script async defer src="https://buttons.github.io/buttons.js"></script>
        <!-- Control Center for Material Dashboard: parallax effects, scripts for the example pages etc -->
        <script src="../admin/js/material-dashboard.min.js?v=3.0.0"></script>

