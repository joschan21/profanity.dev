'use client'

import YouTube from 'react-youtube'

const YoutubePlayer = () => {
  return (
    <div className=''>
      <YouTube
        videoId='ydzgYtLYQRY'
        className='relative w-full aspect-video overflow-hidden rounded-xl' // defaults -> ''
        iframeClassName='absolute inset-0 w-full h-full'
        opts={{autoplay: 0, controls: 0}}
      />
    </div>
  )
}

export default YoutubePlayer
