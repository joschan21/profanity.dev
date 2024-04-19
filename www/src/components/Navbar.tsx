import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-gray-200 bg-white/75 backdrop-blur-lg'>
      <div className='max-w-7xl mx-auto lg:px-8 px-6'>
        <div className='relative flex h-14 items-center justify-between sm:justify-center'>
          <Link
            href='/'
            className='relative sm:absolute inset-y-0 left-0 flex items-center font-semibold'>
            <img src='/swear-emoji.png' className='h-6 w-6 mr-1.5' />
            ProfanityAPI
          </Link>

          <div className='flex items-center gap-6'>
            <Link className='hover:underline' href='#video-demo'>
              Video Demo
            </Link>
            <Link className='hover:underline' href='#api'>
              API
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
