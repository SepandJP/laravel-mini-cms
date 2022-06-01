<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('All Categories') }}
        </h2>
    </x-slot>

    @section('title')
    {{ 'Categories' }}
    @endsection

    <x-slot name="main">
            <div class="container-fluid py-4">
              <div class="row">
                <div class="col-12">
                  <div class="card my-4">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                      <div class="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 class="text-white text-capitalize ps-3">Categories</h6>
                      </div>
                    </div>
                    <div class="card-body px-0 pb-2">
                      <div class="table-responsive p-0">

                          <x-auth-session-status class="alert-success" :status="__('add_category')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-warning" :status="__('edit_category')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-danger" :status="__('delete_category')" >
                          </x-auth-session-status>
                      
                        <table class="table align-items-center mb-0">
                          <thead>
                            <tr>
                              <th></th>
                              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Title</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Update time</th>                              
                            </tr>
                          </thead>

                          <tbody>
                            @php
                            $cnt = 0;
                          @endphp

                            @foreach ($categories as $category)

                            @php
                              $cnt++;
                            @endphp
                            <tr>  

                              <td class="align-middle text-center">
                                <span class="text-secondary text-xs font-weight-bold">{{ $cnt }}</span>
                              </td>

                              <td>
                                <div class="d-flex px-2 py-1">
                                  <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm"><a href="{{route('categories.edit', $category->id)}}">{{Str::limit($category->title, 30)}}</a></h6>
                                  </div>
                                </div>
                              </td>
                             
                              <td class="align-middle text-center">
                                <span class="text-secondary text-xs font-weight-bold">{{$category->updated_at}}</span>
                              </td>

                            </tr>
                            @endforeach
                           
                          </tbody>
                        </table>

                        <!-- Pagination -->
                    <div class="row">
                      <div class="col-12 h-100 d-flex justify-content-center">
                          Show
                          {{($categories->currentPage()-1)* $categories->perPage() + 1}}
                          to 
                          {{ ($categories->currentPage()* $categories->perPage()) }}
                          from   
                          {{ $categories->total() }}
                          photos
                      </div>
                      <div class="col-12 d-flex justify-content-center">{{ $categories->onEachSide(1)->links() }}</div>
                  </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <footer class="footer py-4  ">
                <div class="container-fluid">
                  <div class="row align-items-center justify-content-lg-between">
                    <div class="col-lg-6 mb-lg-0 mb-4">
                      <div class="copyright text-center text-sm text-muted text-lg-start">
                        © <script>
                          document.write(new Date().getFullYear())
                        </script>,
                        made with <i class="fa fa-heart"></i> by
                        <a href="https://www.creative-tim.com" class="font-weight-bold" target="_blank">Creative Tim</a>
                        for a better web.
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <ul class="nav nav-footer justify-content-center justify-content-lg-end">
                        <li class="nav-item">
                          <a href="https://www.creative-tim.com" class="nav-link text-muted" target="_blank">Creative Tim</a>
                        </li>
                        <li class="nav-item">
                          <a href="https://www.creative-tim.com/presentation" class="nav-link text-muted" target="_blank">About Us</a>
                        </li>
                        <li class="nav-item">
                          <a href="https://www.creative-tim.com/blog" class="nav-link text-muted" target="_blank">Blog</a>
                        </li>
                        <li class="nav-item">
                          <a href="https://www.creative-tim.com/license" class="nav-link pe-0 text-muted" target="_blank">License</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
    </x-slot>
</x-app-layout>
