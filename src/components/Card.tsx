

export default function Card() {
  return (
    <div className='w-60 p-2 bg-white rounded-lg transform transition-all hover:-translate-y-2 duration-500 shadow-lg hover:shadow-xl'>
      <img
        className='h-40 object-cover rounded-xl'
        src='https://comicbook.com/wp-content/uploads/sites/4/2025/02/One-Piece-Luffy.jpeg?w=1024'
      />
      <div className='p-2'>
        <h2 className='font-bold text-lg'>Hello</h2>
        <p className='text-sm text-gray-600'>
          Simple Yet Beautiful Card Design with TaiwlindCss. Subscribe to our Youtube channel for
          more ...
        </p>
      </div>
      <div className='m-2'>
        <a
          role='button'
          className='text-white bg-purple-400 px-3 py-1 rounded-md hover:bg-purple-500'
        >
          DETAIL
        </a>
      </div>
    </div>
  );
}
