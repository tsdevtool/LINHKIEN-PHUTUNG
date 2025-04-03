import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import AddToCart from '@/components/ui/AddToCart'
import Loading from '@/components/ui/Loading'
import { useProductStore } from '@/store/useProductStore'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const CategoryParentProductsPage = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const {getProductByCategoryParent, products, isLoading} = useProductStore()
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const perPage = 12

    useEffect(()=>{
        const fetchProducts = async () => {
            await getProductByCategoryParent(id, currentPage, perPage)
            if (products?.total) {
                setTotalPages(Math.ceil(products.total / perPage))
            }
        }
        fetchProducts()
    },[id, currentPage, perPage])

    const handleProductClick = (productId, e) => {
        // Nếu click vào nút AddToCart thì không chuyển trang
        if (e.target.closest('.add-to-cart-button')) {
            return;
        }
        navigate(`/product-info/${productId}`);
    };

    return (
        <>
        {isLoading ? <Loading /> : (
            <>
            <Header />
            <Navbar />
            {
                products?.data?.length > 0 ? (
                    <>
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 my-8 mx-24">
                        {products.data.map((product)=>(
                            <div
                            key={product.id}
                            onClick={(e) => handleProductClick(product.id, e)}
                            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out transform hover:-translate-y-2.5 hover:shadow-xl justify-between cursor-pointer"
                          >
                            <div>
                              {product?.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-500">No image</span>
                                </div>
                              )}
                              <h2 className="text-xl md:text-2xl font-bold line-clamp-3 text-gray-800 dark:text-white mt-4">
                                {product.name}
                              </h2>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-xl font-semibold text-gray-800 dark:text-white">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(product.price)}
                              </span>
                              <div className="add-to-cart-button">
                                <AddToCart product={product} />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2 mb-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 bg-white hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="w-6 h-6 dark:text-black" />
                            </button>
                            <span className="px-4 py-2">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 bg-white hover:bg-gray-50"
                            >
                                <ChevronRightIcon className="w-6 h-6 dark:text-black " />
                            </button>
                        </div>
                    )}
                    </>
                ) : (
                    <div className='container mx-auto'>
                        <h1>Không có sản phẩm</h1>
                    </div>
                )
            }
            </>
        )}
        </>
    )
}

export default CategoryParentProductsPage