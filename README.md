# LocalMotionChallenge

<b>Strategy</b>
==============
Initially cars have no scheduled picks, so for each car we pick a “ride” who’s total distance (vehicle -> origin -> destination) is minimized for the current location of the car.

Once we reach the origin of our first customer we pick him up and check if there are any people in the building that we can take along for the ride. To do this, we use the “peoples” and “picks” queue. We calculate the time it’ll take to drop off everyone we’ve committed to and then add the extra people if the time allows.

<b>Runtime</b>
==============

v = # vehicles
p = # people
b = # buildings

vp           to find best ride
vp           to check riders in building

So vp + vp -> O(vp)
