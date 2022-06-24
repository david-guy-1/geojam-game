
import cv2
import numpy as np


def applyMatrix(img, matrix):
    #applies a 4x4 matrix to each pixel of image
    #recall that arithmetic is done mod 256, so might want to normalize
    return np.dot(img, np.transpose(matrix))

def whitenAlpha(img):
    #r, g, b = alpha
    return applyMatrix(img,np.array([[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,0,0,1]]))

def whitenBrightness(img):
    #r, g, b = (r+g+b)/3
    #again, alpha is unaffected
    return applyMatrix(img,np.array([[1/3,1/3,1/3,0],[1/3,1/3,1/3,0],[1/3,1/3,1/3,0],[0,0,0,1]]))
    
def toColor(img,b,g,r):
    #b, g, r are numbers from 0 to 1.
    #blue part <= alpha*blue number as input
    #similar for the others
    return applyMatrix(whitenAlpha(img),np.array([[b,0,0,0],[g,0,0,0],[r,0,0,0],[0,0,0,1]]))

def toColorBrightness(img,b,g,r):
    #b, g, r are numbers from 0 to 1.
    #blue part <= brightnesss*blue number as input
    #similar for the others
    return applyMatrix(whitenBrightness(img),np.array([[b,0,0,0],[g,0,0,0],[r,0,0,0],[0,0,0,1]]))

    
def addTransparent(img1, img2):
    #uses img2's alpha channel
    #img1's alpha is completely ignored and unaffected
    #remember: 0 is fully transparent, 255 (scaled to 1 here) is opaque
    #img1's value = (1 - img2's alpha) * img1's value + (img2's alpha) * img2's value
    #mutates img1
    alphas = 1/255 * img2[:,:,3]
    oneMinus = np.full(img1.shape[0:2], 1) - alphas
    for i in range(3):
        img1[:,:,i] = np.multiply(oneMinus, img1[:,:,i]) + np.multiply(alphas, img2[:,:,i]) #component wise multiplication


# img1's alpha = img2's alpha. All else unchanged
def copyTransparency(img1, img2):
    img1[:,:,3] = img2[:,:,3]
#first "real" example

#define colors
colors = {
    "blue":[1,0,0],
    "green":[0,1,0],
    "red":[0,0,1],
    "silver":[0.5,0.5,0.5],
    "yellow":[0,1,1],
    "purple":[1,0,0.7],
    "black":[0,0,0],
    "cyan":[1,1,0],
    "gray1":[0.1,0.1,0.1],
    "gray2":[0.2,0.2,0.2],
    "gray3":[0.3,0.3,0.3],
    "white":[1,1,1],
    
}
