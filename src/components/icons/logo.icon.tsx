import IBaseIconProps from "@/lib/interfaces/base-icon-props.interface";

const LogoIcon = ({
                    width = 50, height = 50,
                    className,
                    style
                  }: IBaseIconProps) => {

  return <svg id="logo" viewBox="0 0 304 304" fill="none" className={className} style={style} width={width}
              height={height}>
    <path fillRule="evenodd" clipRule="evenodd"
          d="M184.719 246.103C184.719 211.237 213.079 182.877 247.946 182.877C265.87 182.877 282.076 190.366 293.616 202.52C299.018 187.051 302.088 170.6 302.21 153.289C302.824 69.0684 234.932 1.29914 152.185 0.808063C68.3327 0.316981 0.563404 68.3318 0.195092 151.325C-0.173219 235.3 67.8416 303.56 151.203 303.192C170.478 303.314 188.77 299.631 205.713 293.124C192.822 281.584 184.719 264.764 184.719 246.103ZM155.131 203.87C151.694 214.306 148.133 224.741 143.223 234.44C137.084 246.84 127.14 255.679 113.021 258.503C104.673 260.099 96.3243 259.363 89.3264 253.961C87.2393 252.365 84.9067 249.541 84.7839 247.208C84.6612 244.507 86.1344 240.947 88.0987 239.228C89.4492 238.123 93.6234 238.983 95.465 240.333C98.0431 242.175 99.6391 245.367 101.603 248.068C105.9 254.083 112.162 254.82 117.809 250.032C124.684 244.139 128.245 236.159 130.455 227.811C135.12 210.377 138.926 192.575 143.1 175.019C143.345 174.283 143.1 173.423 143.1 171.95C130.209 169.986 117.318 168.021 103.936 165.934C104.427 162.128 104.918 158.814 105.409 154.517C118.669 156.358 131.928 158.2 145.801 160.164C147.642 152.552 149.361 145.063 151.326 136.96C137.207 134.751 123.457 132.664 109.092 130.454C109.584 126.525 110.075 122.842 110.566 118.913C125.053 121 139.171 123.087 153.781 125.174C155.009 120.878 155.991 116.949 157.096 113.02C161.147 99.6383 164.83 86.1335 173.179 74.5931C181.65 62.9299 192.454 55.3181 207.554 55.932C214.307 56.1775 220.691 58.1419 225.479 63.5438C226.461 64.6487 226.952 64.8942 227.811 67.2269C228.794 70.0506 227.689 74.102 225.97 75.8208C223.269 78.399 219.218 77.0485 216.517 74.4703C214.43 72.3832 212.711 69.805 210.992 67.4724C206.695 61.7022 199.82 60.5973 194.786 65.7536C190.98 69.805 187.174 74.5931 185.578 79.7494C180.545 95.3413 176.493 111.301 171.705 127.998C185.701 130.085 198.715 132.05 212.342 134.014C211.237 137.943 210.255 141.38 209.15 145.309C195.891 143.467 183 141.626 169.864 139.784C168.268 147.764 166.795 155.008 165.076 163.233C178.949 165.32 192.822 167.285 207.309 169.495C206.204 173.301 205.222 176.984 203.994 180.912C190.121 178.948 176.616 176.984 162.743 174.897C160.288 184.718 158.201 194.417 155.131 203.87Z"
          fill="white"/>
    <path
      d="M303.806 246.104C303.806 215.288 278.761 190.243 247.946 190.243C217.13 190.243 192.085 215.288 192.085 246.104C192.085 276.428 216.148 300.982 246.227 301.964H303.806V246.104Z"
      fill="white"/>
    <path
      d="M253.225 220.076V240.947H274.71V251.383H253.225V272.254H242.544V251.383H221.182V240.947H242.544V220.076H253.225Z"
      fill="#0091ff"/>
    <path fillRule="evenodd" clipRule="evenodd"
          d="M155.009 203.87C151.571 214.306 148.011 224.741 143.1 234.44C136.961 246.84 127.017 255.679 112.898 258.503C104.55 260.099 96.2016 259.363 89.2037 253.961C87.1166 252.365 84.784 249.541 84.6612 247.208C84.5384 244.507 86.0117 240.947 87.976 239.228C89.3265 238.123 93.5007 238.983 95.3422 240.333C97.9204 242.175 99.5164 245.367 101.481 248.068C105.778 254.083 112.039 254.82 117.686 250.032C124.562 244.139 128.122 236.159 130.332 227.811C134.997 210.377 138.803 192.575 142.977 175.019C143.223 174.283 142.977 173.423 142.977 171.95C130.086 169.986 117.195 168.021 103.813 165.934C104.304 162.128 104.796 158.814 105.287 154.517C118.546 156.358 131.805 158.2 145.678 160.164C147.52 152.552 149.238 145.063 151.203 136.96C137.084 134.751 123.334 132.664 108.97 130.454C109.461 126.525 109.952 122.842 110.443 118.913C124.93 121 139.048 123.087 153.658 125.174C154.886 120.878 155.868 116.949 156.973 113.02C161.024 99.6383 164.708 86.1335 173.056 74.5931C181.527 62.9299 192.331 55.3181 207.432 55.932C214.184 56.1775 220.568 58.1419 225.356 63.5438C226.338 64.6487 226.829 64.8942 227.689 67.2269C228.671 70.0506 227.566 74.102 225.847 75.8208C223.146 78.399 219.095 77.0485 216.394 74.4703C214.307 72.3832 212.588 69.805 210.869 67.4724C206.572 61.7022 199.697 60.5973 194.663 65.7536C190.858 69.805 187.052 74.5931 185.456 79.7494C180.422 95.3413 176.371 111.301 171.583 127.998C185.578 130.085 198.592 132.05 212.22 134.014C211.115 137.943 210.133 141.38 209.028 145.309C195.768 143.467 182.878 141.626 169.741 139.784C168.145 147.764 166.672 155.008 164.953 163.233C178.826 165.32 192.699 167.285 207.186 169.495C206.081 173.301 205.099 176.984 203.871 180.912C189.998 178.948 176.493 176.984 162.62 174.897C160.288 184.718 158.201 194.417 155.009 203.87Z"
          fill="#0091ff"/>
  </svg>
}

export {LogoIcon};