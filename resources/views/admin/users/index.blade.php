<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Users') }}
        </h2>
    </x-slot>

    @section('title')
    {{ 'Users' }}
    @endsection

    <x-slot name="main">
            <div class="container-fluid py-4">
              <div class="row">
                <div class="col-12">
                  <div class="card my-4">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                      <div class="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 class="text-white text-capitalize ps-3">Authors table</h6>
                      </div>
                    </div>
                    <div class="card-body px-0 pb-2">
                      <div class="table-responsive p-0">

                          <x-auth-session-status class="alert-success" :status="__('add_user')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-warning" :status="__('edit_user')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-danger" :status="__('delete_user')" >
                          </x-auth-session-status>
                      
                        <table class="table align-items-center mb-0">
                          <thead>
                            <tr>
                              <th></th>
                              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">User</th>
                              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Roles</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Email Status</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Register Time</th>
                              <th class="text-secondary opacity-7"></th>
                            </tr>
                          </thead>
                          <tbody>

                            @foreach ($users as $user)
                            <tr>                              
                                <td>
                                  <img src="{{$user->photo_id ? $user->photo->path : "../images/Default_Avatar.jpg"}}" width="80">
                                </td>
                              <td>
                                <div class="d-flex px-2 py-1">
                                  <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm">{{$user->name}}</h6>
                                    <p class="text-xs text-secondary mb-0">{{$user->email}}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <ul>
                                  @foreach ($user->roles as $role)
                                  <li class="text-xs text-secondary mb-0">{{$role->name}}</li>
                                  @endforeach
                                </ul>
                              </td>

                              @if ($user->email_verified_at != NULL)
                                <td class="align-middle text-center text-sm">
                                  <span class="badge badge-sm bg-gradient-success">Verified</span>
                                </td>
                                @else
                                <td class="align-middle text-center text-sm">
                                  <span class="badge badge-sm bg-gradient-secondary">Unverified</span>
                                </td>
                              @endif
                              
                              <td class="align-middle text-center">
                                <span class="text-secondary text-xs font-weight-bold">{{$user->created_at}}</span>
                              </td>
                              <td class="align-middle">
                                <a href="{{route('users.edit', $user->id)}}" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                  Edit
                                </a>
                              </td>
                            </tr>
                            @endforeach
                           
                          </tbody>
                        </table>
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

    @section('scripts')
        <script>
            var win = navigator.platform.indexOf('Win') > -1;
            if (win && document.querySelector('#sidenav-scrollbar')) {
                var options = {
                    damping: '0.5'
                }
                Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
            }
        </script>
    @endsection
</x-app-layout>
