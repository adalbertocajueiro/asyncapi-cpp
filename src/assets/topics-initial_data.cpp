#include "generated.cpp"
#include "conversion-functions.cpp"

std::string COMMANDS_TOPIC = "ROBOT_NAME/commands";
std::string MOVED_TOPIC = "ROBOT_NAME/moved";
std::string METAINFO_TOPIC = "metainfo";

/**
 * The global metainfo of this arm.
 *
 * TODO: Adjust only the reference values (the second argument of ref_to_angle)
 * for each motor
 *
 **/
const std::list<JointInfo> METAINFOS =
    {
        JointInfo(ref_to_angle(1, -450), ref_to_angle(1, 500)),
        JointInfo(ref_to_angle(2, -950), ref_to_angle(2, 800)),
        JointInfo(ref_to_angle(3, -350), ref_to_angle(3, 350)),
        JointInfo(ref_to_angle(4, -1500), ref_to_angle(4, 1600)),
        JointInfo(-360, 360),
        JointInfo(0, 100)};


/**
 * Function that registers the server into the broker using the suitable topics
 **/
void subscribe_all_topics()
{

    std::cout << "Subscribing on topic "
              << METAINFO_TOPIC
              << std::endl;

    mosquitto_subscribe(mosq, NULL, METAINFO_TOPIC.c_str(), 0);

    std::cout << "Subscribing on topic "
              << COMMANDS_TOPIC.c_str()
              << std::endl;

    mosquitto_subscribe(mosq, NULL, COMMANDS_TOPIC.c_str(), 0);
}

/**
 * Fuction that publishes a message (the string representation of a JSON object)
 * using a specific topic
 **/
int publish_message(std::string topic, const char *buf)
{
    char *payload = (char *)buf;
    int rc = mosquitto_publish(mosq, NULL, topic.c_str(), strlen(payload), payload, 1, false);
    return rc;
}
