        
        <!-- Footer-->
        <footer class="border-top">
          <div class="container px-4 px-lg-5">
              <div class="row gx-4 gx-lg-5 justify-content-center">
                  <div class="col-md-10 col-lg-8 col-xl-7">
                    <div class="row">
                        <ul class="list-inline text-center">
                                <li class="list-inline-item">
                                    <a href="https://linkedin.com/in/sepandJP" target="_blank">
                                        <span class="fa-stack fa-lg">
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fab fa-linkedin fa-stack-1x fa-inverse"></i>
                                        </span>
                                    </a>
                                </li>
                                <li class="list-inline-item">
                                    <a href="https://github.com/SepandJP/laravel-mini-cms" target="_blank">
                                        <span class="fa-stack fa-lg">
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fab fa-github fa-stack-1x fa-inverse"></i>
                                        </span>
                                    </a>
                                </li>
                                <li class="list-inline-item">
                                    <a href="https://codepen.io/sepand" target="_blank">
                                        <span class="fa-stack fa-lg">
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fab fa-codepen fa-stack-1x fa-inverse"></i>
                                        </span>
                                    </a>
                                </li>
                                <li class="list-inline-item">
                                    <a href="https://t.me/SepandJP" target="_blank">
                                        <span class="fa-stack fa-lg">
                                            <i class="fas fa-circle fa-stack-2x"></i>
                                            <i class="fab fa-telegram fa-stack-1x fa-inverse"></i>
                                        </span>
                                    </a>
                                </li>
                        </ul>
                    </div>
                      <div class="small text-center text-muted fst-italic">Copyright &copy; Your Website 2021</div>
                  </div>
              </div>
          </div>
      </footer>

        @yield('footer')
        
        <!--  Bootstrap Core JS Files   -->
        <script src="{{ asset('admin/js/core/bootstrap.bundle.min.js') }}"></script>

        <!-- Core theme JS-->
        <script src="{{ asset('js/scripts.js') }}"></script>

            @yield('scripts')

