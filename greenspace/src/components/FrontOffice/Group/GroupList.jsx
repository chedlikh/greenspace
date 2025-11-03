import { useState, useEffect } from 'react';
import { useGroups, fetchImageWithToken, useAuthToken } from '../../../services/group';
import { Link } from 'react-router-dom';
import Pagination from './../Publication/Pagination';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from './../ErrorMessage';
import { toast } from 'react-toastify';

const GroupList = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createDate');
  const [direction, setDirection] = useState('desc');
  const [imageUrls, setImageUrls] = useState({});

  const token = useAuthToken();
  const { data, isLoading, isError, error } = useGroups(page, size, sortBy, direction);

  useEffect(() => {
    if (!data?.content || !token) return;

    const loadImages = async () => {
      const newImageUrls = {};
      for (const group of data.content) {
        if (group.coverPhotoUrl) {
          newImageUrls[`cover_${group.id}`] = await fetchImageWithToken(group.coverPhotoUrl, token);
        }
        if (group.profilePhotoUrl) {
          newImageUrls[`profile_${group.id}`] = await fetchImageWithToken(group.profilePhotoUrl, token);
        }
      }
      setImageUrls(newImageUrls);
    };

    loadImages();

    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [data, token]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div className="main-content right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-sidebar-left pe-0">
          <div className="row">
            <div className="col-xl-12">
              <div className="card shadow-xss w-100 d-block d-flex border-0 p-4 mb-3">
                <div className="card-body d-flex align-items-center p-0">
                  <h2 className="fw-700 mb-0 mt-0 font-md text-grey-900">Groups</h2>
                  <div className="search-form-2 ms-auto">
                    <i className="ti-search font-xss"></i>
                    <input
                      type="text"
                      className="form-control text-grey-500 mb-0 bg-greylight theme-dark-bg border-0"
                      placeholder="Search here."
                    />
                  </div>
                  <a href="#" className="btn-round-md ms-2 bg-greylight theme-dark-bg rounded-3">
                    <i className="feather-filter font-xss text-grey-500"></i>
                  </a>
                </div>
              </div>

              <div className="row ps-2 pe-1">
                {data?.content?.length > 0 ? (
                  data.content.map((group) => (
                    <div key={group.id} className="col-md-6 col-sm-6 pe-2 ps-2">
                      <div className="card d-block border-0 shadow-xss rounded-3 overflow-hidden mb-3">
                        <div
                          className="card-body position-relative h100 bg-image-cover bg-image-center"
                          style={{
                            backgroundImage: `url(${imageUrls[`cover_${group.id}`] || '/default-cover.png'})`,
                          }}
                        ></div>
                        <div className="card-body d-block w-100 pl-10 pe-4 pb-4 pt-0 text-left position-relative">
                          <figure
                            className="avatar position-absolute w75 z-index-1"
                            style={{ top: '-40px', left: '15px' }}
                          >
                            <img
                              src={imageUrls[`profile_${group.id}`] || '/default-group.png'}
                              alt={`${group.name} profile`}
                              className="float-right p-1 bg-white rounded-circle w-100"
                            />
                          </figure>
                          <div className="clearfix"></div>
                          <h4 className="fw-700 font-xsss mt-3 mb-1">
                            <Link to={`/groups/${group.id}`} className="text-grey-900">
                              {group.name}
                            </Link>
                          </h4>
                          <p className="fw-500 font-xsssss text-grey-500 mt-0 mb-3 line-clamp-2">
                            {group.description}
                          </p>
                          <span className="position-absolute right-15 top-0 d-flex align-items-center">
                            <a
                              href="#"
                              className="d-lg-block d-none"
                              onClick={() => toast.info('Video feature not implemented')}
                            >
                              <i className="feather-video btn-round-md font-md bg-primary-gradiant text-white"></i>
                            </a>
                            <Link
                              to={`/groups/${group.id}`}
                              className="text-center p-2 lh-24 w100 ms-1 ls-3 d-inline-block rounded-xl bg-current font-xsssss fw-700 ls-lg text-white"
                            >
                              VIEW GROUP
                            </Link>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-md-12 pe-2 ps-2">
                    <div className="card w-100 text-center shadow-xss rounded-xxl border-0 p-4 mb-3 mt-0">
                      <p className="text-grey-500 font-xssss">No groups available.</p>
                    </div>
                  </div>
                )}
              </div>

              <Pagination
                currentPage={page}
                totalPages={data?.totalPages || 0}
                onPageChange={setPage}
                pageSize={size}
                onPageSizeChange={setSize}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupList;