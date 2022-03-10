<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Posts') }}
        </h2>
    </x-slot>

    @section('title')
    {{ 'Posts' }}
    @endsection

    <x-slot name="main">
            <div class="container-fluid py-4">
              <div class="row">
                <div class="col-12">
                  <div class="card my-4">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                      <div class="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 class="text-white text-capitalize ps-3">{{--{{ Auth::user()->name }}'s--}} posts</h6>
                      </div>
                    </div>
                    <div class="card-body px-0 pb-2">
                      <div class="table-responsive p-0">

                          <x-auth-session-status class="alert-success" :status="__('add_post')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-warning" :status="__('edit_post')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-danger" :status="__('delete_post')" >
                          </x-auth-session-status>
                      
                        <table class="table align-items-center mb-0">
                          <thead>
                            <tr>
                              <th></th>
                              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Title</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Description</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Category</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Update time</th>
                              <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                              <th class="text-secondary opacity-7"></th>
                            </tr>
                          </thead>
                          <tbody>

                            @foreach ($posts as $post)
                            <tr>  

                              <td>
                                <img src="{{$post->photo ? $post->photo->path : "../images/Default_Post.jpg"}}" width="80">
                              </td>  

                              <td>
                                <div class="d-flex px-2 py-1">
                                  <div class="d-flex flex-column justify-content-center">
                                    <h6 class="mb-0 text-sm"><a href="{{route('posts.edit', $post->id)}}">{{Str::limit($post->title, 30)}}</a></h6>
                                    <a href="{{ route('users.edit', $post->user->id) }}" class="text-xs text-secondary mb-0">{{$post->user->name}}</a>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span class="text-secondary text-xs font-weight-bold">{{Str::limit($post->description, 40)}}</span>
                              </td>

                              <td>
                                <a href="{{ route('categories.edit', $post->category->id) }}" class="text-center text-secondary text-xs font-weight-bold">{{$post->category->title}}</a>
                              </td>
                             
                              <td class="align-middle text-center">
                                <span class="text-secondary text-xs font-weight-bold">{{$post->updated_at}}</span>
                              </td>

                              @if ($post->status == 1)
                              <td class="align-middle text-center text-sm">
                                <span class="badge badge-sm bg-gradient-success">Active</span>
                              </td>
                              @else
                              <td class="align-middle text-center text-sm">
                                <span class="badge badge-sm bg-gradient-secondary">Inactive</span>
                              </td>
                              @endif

                            </tr>
                            @endforeach
                           
                          </tbody>
                        </table>
                        
                        <!-- Pagination -->
                    <div class="row">
                      <div class="col-12 h-100 d-flex justify-content-center">
                          Show
                          {{($posts->currentPage()-1)* $posts->perPage() + 1}}
                          to 
                          {{ ($posts->currentPage()* $posts->perPage()) }}
                          from   
                          {{ $posts->total() }}
                          photos
                      </div>
                      <div class="col-12 d-flex justify-content-center">{{ $posts->onEachSide(1)->links() }}</div>
                  </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
