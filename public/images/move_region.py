
import cv2
import numpy as np
import copy
import matplotlib as mpl

def imshow(title,im):
    """Decorator for OpenCV "imshow()" to handle images with transparency"""

    # Check we got np.uint8, 2-channel (grey + alpha) or 4-channel RGBA image
    if (im.dtype == np.uint8) and (len(im.shape)==3) and (im.shape[2] in set([2,4])):

       # Pick up the alpha channel and delete from original
       alpha = im[...,-1]/255.0
       im = np.delete(im, -1, -1)

       # Promote greyscale image to RGB to make coding simpler
       if len(im.shape) == 2:
          im = np.stack((im,im,im))

       h, w, _ = im.shape

       # Make a checkerboard background image same size, dark squares are grey(102), light squares are grey(152)
       f = lambda i, j: 102 + 50*((i+j)%2)
       bg = np.fromfunction(np.vectorize(f), (100,100)).astype(np.uint8)

       # Resize to square same length as longer side (so squares stay square), then trim
       if h>w:
          longer = h
       else:
          longer = w
       bg = cv2.resize(bg, (longer,longer), interpolation=cv2.INTER_NEAREST)
       # Trim to correct size
       bg = bg[:h,:w]

       # Blend, using result = alpha*overlay + (1-alpha)*background
       im = (alpha[...,None] * im + (1.0-alpha[...,None])*bg[...,None]).astype(np.uint8)

    cv2.imshow(title,im)

    
def move_region(image, tlx, tly, brx, bry, displace_x, displace_y, copy_=False):
    image = cv2.imread(image, cv2.IMREAD_UNCHANGED)
    xSize = brx-tlx
    ySize = bry-tly
    piece = copy.deepcopy(image[tly:bry, tlx:brx, 0:4])
    if(copy_ == False):
        image[tly:bry, tlx:brx, 0:4] = np.zeros([ySize , xSize, 4])
    image[tly+displace_y:tly+displace_y+ySize, tlx+displace_x:tlx+displace_x+xSize, 0:4] = piece
    
    return image


##i=7
##
##def lerp(x0, y0, x1, y1, t):
##    return [x0*(1-t) + x1*t, y0*(1-t) + y1*t]
##    
##data = move_region("spawner1_boom.png", 200*i, 0, 200*(i+1), 200, 200, 0, True)
##for x in range(200):
##    for y in range((i+1)*200, (i+1)*200+200):
##        val = lerp(0, 0.3, 255, 1, data[x,y,0]/255)
##        data[x,y,3]= int(data[x,y,3]*val[1])
##
i=3
size = 40

data = move_region("sheets/follow_boom.png", size*i, 0, size*(i+1), size, size, 0, True)
#imshow("", data)
cv2.imwrite("sheets/follow_boom.png", data)
    
