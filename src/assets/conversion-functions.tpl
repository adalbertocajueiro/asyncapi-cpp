#include <stdio.h>

/**
 * Function to convert angles into reference values. This function is
 * specific for each arm.
 *
 * TODO: Adjust this implementation according to your arm
 *
 * DOUBT: angles are in DEGREES or in RADIANS?
 **/
int angle_to_ref(int motor, float angle)
{
    switch (motor)
    {
    case 1:
        return int(-3 * angle);
    case 2:
        return int(-9.4 * angle);
    case 3:
        return int(-3.1 * angle);
    case 4:
        return int(-17.61158871 * angle);
    default:
        puts("Maximum actionable joint is J4 for them moment");
        break;
    }
    return 0;
}

/**
 * Function to convert reference values into angles. This function is
 * specific for each arm.
 *
 * TODO: Adjust this implementation according to your arm
 *
 * DOUBT: angles are in DEGREES or in RADIANS?
 **/
double ref_to_angle(int motor, int ref)
{
    switch (motor)
    {
    case 1:
        return ((-1.0 / 3.0) * ref);
    case 2:
        return ((-1 / 9.4) * ref);
    case 3:
        return ((-1 / 3.1) * ref);
    case 4:
        return (-0.056780795 * ref);
    default:
        puts("Maximum actionable joint is J4 for them moment");
        break;
    }
    return 0;
}