#include "definitions.cpp"
#include "conversion-functions.cpp"

/**
 * The global metainfo of this arm.
 *
 * TODO: Adjust only the reference values (the second argument of ref_to_angle)
 * for each motor
 *
 **/
MetaInfoObject initial_metainfoobj()
{
    MetaInfoObject result = MetaInfoObject();

    JointInfo j1 = JointInfo();
    j1.minimum = ref_to_angle(1, -450);
    j1.maximum = ref_to_angle(1, 500);

    JointInfo j2 = JointInfo();
    j2.minimum = ref_to_angle(2, -950);
    j2.maximum = ref_to_angle(2, 800);
    
    JointInfo j3 = JointInfo();
    j3.minimum = ref_to_angle(3, -350);
    j3.maximum = ref_to_angle(3, 350);
    
    JointInfo j4 = JointInfo();
    j4.minimum = ref_to_angle(4, -1500);
    j4.maximum = ref_to_angle(4, 1600);
    
    JointInfo j5 = JointInfo();
    j5.minimum = -360;
    j5.maximum = 360;

    JointInfo j6 = JointInfo();
    j6.minimum = 0;
    j6.maximum = 100;

    result.joints.push_back(j1);
    result.joints.push_back(j2);
    result.joints.push_back(j3);
    result.joints.push_back(j4);
    result.joints.push_back(j5);
    result.joints.push_back(j6);

    return result;
}