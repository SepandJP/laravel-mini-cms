<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Comments') }}
        </h2>
    </x-slot>

    @section('title')
    {{ 'Comments' }}
    @endsection

    <x-slot name="main">
            <div class="container-fluid py-4">
              <div class="row">
                <div class="col-12">
                  <div class="card my-4">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                      <div class="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 class="text-white text-capitalize ps-3">{{--{{ Auth::user()->name }}'s--}} Commentss</h6>
                      </div>
                    </div>
                    <div class="card-body px-0 pb-2">
                      <div class="table-responsive p-0">

                          <x-auth-session-status class="alert-success" :status="__('approve_comment')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-danger" :status="__('reject_comment')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-warning" :status="__('edit_comment')" >
                          </x-auth-session-status>
                          <x-auth-session-status class="alert-danger" :status="__('delete_comments')" >
                          </x-auth-session-status>
                      
                        <table class="table align-items-center mb-0">
                          <thead>
                            <tr>
                              <th class="text-center text-uppercase text-s font-weight-bolder">Description</th>
                              <th class="text-center text-uppercase text-s font-weight-bolder">Post</th>
                              <th class="text-center text-uppercase text-s font-weight-bolder">Write time</th>
                              <th class="text-center text-uppercase text-s font-weight-bolder">Status</th>
                              <th class="text-secondary opacity-7"></th>
                            </tr>
                          </thead>
                          <tbody>

                            @foreach ($comments as $comment)
                            <tr>  

                              <td>
                                <div class="d-flex px-2 py-1">
                                  <div class="d-flex flex-column justify-content-center">
                                    <a href="{{ route('comments.edit', $comment->id) }}" class="text-xs text-secondary mb-0">
                                      <span class="text-secondary text-xs font-weight-bold">{{Str::limit($comment->description, 40)}}</span>
                                    </a>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <a href="{{ route('posts.edit', $comment->post->id) }}" class="text-center text-secondary text-xs font-weight-bold">
                                  <span class="text-secondary text-xs font-weight-bold">{{Str::limit($comment->post->title, 40)}}</span>
                                </a>
                              </td>

                              <td class="align-middle text-center">
                                <span class="text-secondary text-xs font-weight-bold">{{$comment->created_at}}</span>
                              </td>

                              @if ($comment->status == 1)
                              <td class="align-middle text-center text-sm">
                                <span class="badge badge-sm bg-gradient-success">Published</span>
                              </td>
                              @else
                              <td class="align-middle text-center text-sm">
                                <span class="badge badge-sm bg-gradient-secondary">UnPublished</span>
                              </td>
                              @endif

                              @if ($comment->status == 1)
                              <td class="align-middle text-center text-sm">
                                <form role="form" method="POST" action="{{ route('comments.action', $comment->id) }}">
                                  @csrf
                                  <input type="hidden" name="action" value="reject">
                                  <button class="btn btn-sm bg-gradient-danger">Reject</button>
                                </form>
                              </td>
                              @else
                              <td class="align-middle text-center text-sm">
                                <form role="form" method="POST" action="{{ route('comments.action', $comment->id) }}">
                                  @csrf
                                  <input type="hidden" name="action" value="approve">
                                  <button class="btn btn-sm bg-gradient-success">Approve</button>
                                </form>
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
                          {{($comments->currentPage()-1)* $comments->perPage() + 1}}
                          to 
                          {{ ($comments->currentPage()* $comments->perPage()) }}
                          from   
                          {{ $comments->total() }}
                          photos
                      </div>
                      <div class="col-12 d-flex justify-content-center">{{ $comments->onEachSide(1)->links() }}</div>
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
